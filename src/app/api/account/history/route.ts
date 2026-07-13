import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { items, wasteLog } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";
import { isSameOriginRequest } from "@/lib/request-security";
import { checkItemMutationRateLimit } from "@/app/api/items/_lib";

// Erase account history: delete the user's activity log plus their consumed and
// wasted item records. Active pantry items are left untouched. waste_log has no
// FK to items, so the two deletes are independent.
export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request, { requireOriginHeader: true })) {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }

  const userId = await getCurrentUserId();
  const rateLimit = checkItemMutationRateLimit(userId);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many account changes. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  await db.transaction(async (tx) => {
    await tx.delete(wasteLog).where(eq(wasteLog.userId, userId));
    await tx
      .delete(items)
      .where(and(eq(items.userId, userId), inArray(items.status, ["consumed", "wasted"])));
  });

  return NextResponse.json({ success: true });
}
