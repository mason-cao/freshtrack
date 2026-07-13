import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";
import { isSameOriginRequest } from "@/lib/request-security";
import { checkItemMutationRateLimit } from "@/app/api/items/_lib";

// Clear pantry: delete every item the user has added, across all statuses. The
// waste_log is intentionally left intact so the savings/waste history (Stats)
// is preserved.
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
  await db.delete(items).where(eq(items.userId, userId));

  return NextResponse.json({ success: true });
}
