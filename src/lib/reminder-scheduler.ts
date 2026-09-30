import * as Sentry from "@sentry/nextjs";
import { sendDueReminders, type ReminderRunSummary } from "@/db/reminders";

// Runs inside the production server (see src/instrumentation.ts). Each run is
// idempotent, so restarts and overlapping instances cannot double-send.
export const REMINDER_FIRST_RUN_DELAY_MS = 60 * 1_000;
export const REMINDER_RUN_INTERVAL_MS = 15 * 60 * 1_000;

const state = globalThis as typeof globalThis & { freshtrackReminderScheduler?: boolean };

/** Starts the scheduler once per process and returns a function that stops it. */
export function startReminderScheduler(
  run: () => Promise<ReminderRunSummary> = () => sendDueReminders()
): () => void {
  if (state.freshtrackReminderScheduler) return () => undefined;
  state.freshtrackReminderScheduler = true;

  let running = false;
  async function tick() {
    if (running) return;
    running = true;
    try {
      const summary = await run();
      if (summary.sent > 0 || summary.failed > 0) {
        console.info(
          `[reminders] sent ${summary.sent}, failed ${summary.failed}` +
            (summary.stoppedEarly ? ", paused by rate limit" : "")
        );
      }
      if (summary.failed > 0) {
        Sentry.captureMessage(`[reminders] ${summary.failed} reminder emails failed to send`, "error");
      }
    } catch (error) {
      console.error("[reminders] run failed", error);
      Sentry.captureException(error);
    } finally {
      running = false;
    }
  }

  // unref: the timers never keep a process alive on their own.
  const firstRun = setTimeout(tick, REMINDER_FIRST_RUN_DELAY_MS);
  const interval = setInterval(tick, REMINDER_RUN_INTERVAL_MS);
  firstRun.unref?.();
  interval.unref?.();

  return () => {
    clearTimeout(firstRun);
    clearInterval(interval);
    state.freshtrackReminderScheduler = false;
  };
}
