import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { siteUrl } from "@/lib/site-url";
import { unsubscribeSecret, verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

const MAX_FORM_BYTES = 1024;

// Turns off reminder emails for the user a signed token names. Deliberately
// open to cross-site requests: mail providers POST here for RFC 8058 one-click
// unsubscribe, and the token is the only credential.
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const userId = verifyUnsubscribeToken(token, unsubscribeSecret());

  // The unsubscribe page's form marks itself so people land back on a page;
  // mail-provider one-click requests just get a status code.
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  const form = contentLength > 0 && contentLength <= MAX_FORM_BYTES
    ? await request.formData().catch(() => null)
    : null;
  const fromPage = form?.get("source") === "page";

  if (userId) {
    await db.update(users).set({ reminderEmailsEnabled: false }).where(eq(users.id, userId));
  }

  if (fromPage) {
    const status = userId ? "done" : "invalid";
    return NextResponse.redirect(new URL(`/unsubscribe?status=${status}`, siteUrl), 303);
  }
  return userId
    ? NextResponse.json({ unsubscribed: true })
    : NextResponse.json({ error: "Invalid unsubscribe link." }, { status: 400 });
}
