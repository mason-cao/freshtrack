import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ReminderSettings } from "@/components/settings/reminder-settings";
import { getCurrentUserId } from "@/lib/session";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  const [user] = await db
    .select({
      email: users.email,
      reminderEmailsEnabled: users.reminderEmailsEnabled,
      timeZone: users.timeZone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 xl:text-3xl">Settings</h1>
        <p className="mt-0.5 text-sm text-stone-500 xl:text-base">Choose how FreshTrack keeps in touch.</p>
      </div>
      <ReminderSettings
        email={user.email}
        initialEnabled={user.reminderEmailsEnabled}
        timeZone={user.timeZone}
      />
    </div>
  );
}
