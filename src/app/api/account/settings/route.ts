import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { validateAccountSettingsPatch } from "@/lib/account-settings";
import { getCurrentUserId } from "@/lib/session";
import { isSameOriginRequest } from "@/lib/request-security";
import { checkItemMutationRateLimit } from "@/lib/rate-limits";
import { readLimitedJsonBody } from "@/lib/request-body";

const MAX_SETTINGS_BODY_BYTES = 1024;

// Update the reminder email toggle and/or the browser-reported time zone.
export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request, { requireOriginHeader: true })) {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }

  const userId = await getCurrentUserId();
  const rateLimit = checkItemMutationRateLimit(userId);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many account changes. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await readLimitedJsonBody(request, MAX_SETTINGS_BODY_BYTES, {
    requireJsonContentType: true,
  });
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: body.status });

  const validation = validateAccountSettingsPatch(body.body);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

  const [updated] = await db
    .update(users)
    .set(validation.data)
    .where(eq(users.id, userId))
    .returning({
      reminderEmailsEnabled: users.reminderEmailsEnabled,
      timeZone: users.timeZone,
    });
  if (!updated) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  return NextResponse.json(updated);
}
