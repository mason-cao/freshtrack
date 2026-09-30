import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./lib/sentry";

// Runs once when a Next.js server instance starts.
export async function register() {
  Sentry.init(sentryOptions);
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { shouldRunReminderScheduler } = await import("./lib/reminder-schedule");
  if (!shouldRunReminderScheduler(process.env)) return;

  const { startReminderScheduler } = await import("./lib/reminder-scheduler");
  startReminderScheduler();
}

// Reports errors thrown while rendering pages and running route handlers.
export const onRequestError = Sentry.captureRequestError;
