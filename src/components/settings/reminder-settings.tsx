"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { fetchJson } from "@/lib/api-client";
import { REMINDER_SEND_HOURS, REMINDER_WINDOW_DAYS } from "@/lib/reminder-schedule";
import { cn } from "@/lib/utils";

interface ReminderSettingsProps {
  email: string;
  initialEnabled: boolean;
  /** Last zone the browser reported; null until the app has been opened since reminders launched. */
  timeZone: string | null;
}

export function ReminderSettings({ email, initialEnabled, timeZone }: ReminderSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    if (saving) return;
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    setError(null);
    try {
      await fetchJson("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderEmailsEnabled: next }),
      });
    } catch (err) {
      setEnabled(!next);
      setError(err instanceof Error ? err.message : "Could not save your reminder setting.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-labelledby="reminder-settings-title"
      className="rounded-2xl border border-warm-100 bg-warm-white p-5 shadow-warm-sm sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-sage-50 p-2.5 text-sage-700">
            <BellRing className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="reminder-settings-title" className="text-base font-semibold text-stone-900">
              Expiry reminder emails
            </h2>
            <p className="mt-1 max-w-[60ch] text-sm leading-6 text-stone-500">
              Get an email at <span className="font-medium text-stone-700">{email}</span> around{" "}
              {REMINDER_SEND_HOURS.start}am when something in your pantry expires within{" "}
              {REMINDER_WINDOW_DAYS} days. At most one a day, and only when something is about to go bad.
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby="reminder-settings-title"
          onClick={handleToggle}
          disabled={saving}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white disabled:cursor-wait",
            enabled ? "bg-sage-500" : "bg-warm-200"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-block h-5 w-5 rounded-full bg-white shadow-warm-sm transition-transform duration-200",
              enabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      <div className="mt-4 border-t border-warm-100 pt-4 text-sm text-stone-500">
        <p aria-live="polite">
          {enabled ? "Reminder emails are on." : "Reminder emails are off."}{" "}
          {timeZone
            ? `They follow your time zone, ${timeZone}.`
            : "They follow your device's time zone."}
        </p>
        {error && (
          <p role="alert" className="mt-2 text-terracotta-600">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
