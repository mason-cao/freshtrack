import { createHmac, timingSafeEqual } from "node:crypto";

// Signed "stop reminder emails" links: they work without signing in (mail apps
// post them directly) but cannot be forged for another user.
const PURPOSE = "freshtrack:reminders:unsubscribe:";

function sign(userId: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(PURPOSE + userId).digest();
}

export function createUnsubscribeToken(userId: string, secret: string): string {
  return `${Buffer.from(userId).toString("base64url")}.${sign(userId, secret).toString("base64url")}`;
}

/** The user id the token was issued for, or null if it is not genuine. */
export function verifyUnsubscribeToken(
  token: string | null | undefined,
  secret: string
): string | null {
  const parts = token?.split(".");
  if (!parts || parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const userId = Buffer.from(parts[0], "base64url").toString("utf8");
  const expected = sign(userId, secret);
  const provided = Buffer.from(parts[1], "base64url");
  if (!userId || provided.length !== expected.length) return null;
  return timingSafeEqual(provided, expected) ? userId : null;
}

export function unsubscribeSecret(env: Record<string, string | undefined> = process.env): string {
  const secret = env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is required to sign unsubscribe links.");
  return secret;
}
