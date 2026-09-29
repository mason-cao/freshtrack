// Runs once when a Next.js server instance starts.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { shouldRunReminderScheduler } = await import("./lib/reminder-schedule");
  if (!shouldRunReminderScheduler(process.env)) return;

  const { startReminderScheduler } = await import("./lib/reminder-scheduler");
  startReminderScheduler();
}
