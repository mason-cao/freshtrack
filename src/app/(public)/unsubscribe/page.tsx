import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { AlertCircle, CheckCircle2, Leaf, MailX } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { unsubscribeSecret, verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

export const metadata: Metadata = {
  title: "Reminder emails",
  robots: { index: false, follow: false, nocache: true },
};

interface PageProps {
  searchParams: Promise<{ token?: string; status?: string }>;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}${"•".repeat(Math.min(Math.max(local.length - 1, 1), 6))}@${domain}`;
}

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MailX;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-warm-100 bg-warm-white p-6 shadow-warm sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-sage-700">
          <Leaf className="h-4 w-4" aria-hidden="true" />
          FreshTrack
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-xl bg-sage-50 p-2.5 text-sage-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">{title}</h1>
        </div>
        <div className="mt-3 space-y-4 text-sm leading-6 text-stone-600">{children}</div>
      </section>
    </main>
  );
}

const settingsLink = (
  <Link href="/settings" className="font-semibold text-sage-700 underline underline-offset-2">
    Settings
  </Link>
);

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token, status } = await searchParams;

  if (status === "done") {
    return (
      <Panel icon={CheckCircle2} title="You're unsubscribed">
        <p>FreshTrack won&apos;t send you reminder emails anymore. You can turn them back on anytime in {settingsLink}.</p>
      </Panel>
    );
  }

  const userId = status === "invalid" ? null : verifyUnsubscribeToken(token, unsubscribeSecret());
  const [user] = userId
    ? await db
        .select({ email: users.email, reminderEmailsEnabled: users.reminderEmailsEnabled })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
    : [];

  if (!token || !user) {
    return (
      <Panel icon={AlertCircle} title="This link doesn't work">
        <p>It may be incomplete or out of date. You can manage reminder emails in {settingsLink}.</p>
      </Panel>
    );
  }

  if (!user.reminderEmailsEnabled) {
    return (
      <Panel icon={CheckCircle2} title="Already unsubscribed">
        <p>
          Reminder emails are off for {maskEmail(user.email)}. You can turn them back on in {settingsLink}.
        </p>
      </Panel>
    );
  }

  // A button rather than unsubscribing on page load: mail scanners open links.
  return (
    <Panel icon={MailX} title="Stop reminder emails?">
      <p>
        FreshTrack emails {maskEmail(user.email)} when something in the pantry is about to expire,
        at most once a day.
      </p>
      <form action={`/api/reminders/unsubscribe?token=${encodeURIComponent(token)}`} method="post">
        <input type="hidden" name="source" value="page" />
        <Button type="submit" className="w-full">
          Stop reminder emails
        </Button>
      </form>
      <p className="text-xs text-stone-500">You can turn them back on anytime in {settingsLink}.</p>
    </Panel>
  );
}
