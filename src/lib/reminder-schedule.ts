// When expiry reminder emails go out: in each user's local morning, at most
// once per local day, for items expiring today through REMINDER_WINDOW_DAYS out.

/** Used until a user's browser reports a zone; most users are in the US. */
export const DEFAULT_REMINDER_TIME_ZONE = "America/New_York";
/** Local hours [start, end) in which a reminder may be sent. */
export const REMINDER_SEND_HOURS = { start: 8, end: 21 } as const;
/** Items expiring today through this many days from today are included. */
export const REMINDER_WINDOW_DAYS = 2;

const MAX_TIME_ZONE_LENGTH = 64;
const DAY_MS = 24 * 60 * 60 * 1_000;

export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || !value || value.length > MAX_TIME_ZONE_LENGTH) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function resolveReminderTimeZone(value: string | null | undefined): string {
  return isValidTimeZone(value) ? value : DEFAULT_REMINDER_TIME_ZONE;
}

export function localDateAndHour(now: Date, timeZone: string): { date: string; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

function dateToUtcMs(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function addDaysToDate(date: string, days: number): string {
  return new Date(dateToUtcMs(date) + days * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((dateToUtcMs(to) - dateToUtcMs(from)) / DAY_MS);
}

export function isReminderDue({
  now,
  timeZone,
  lastReminderOn,
}: {
  now: Date;
  timeZone: string;
  lastReminderOn: string | null;
}): { due: boolean; today: string } {
  const { date: today, hour } = localDateAndHour(now, timeZone);
  const inSendHours = hour >= REMINDER_SEND_HOURS.start && hour < REMINDER_SEND_HOURS.end;
  const alreadySentToday = lastReminderOn !== null && lastReminderOn >= today;
  return { due: inSendHours && !alreadySentToday, today };
}

type SchedulerEnv = Partial<Record<"NODE_ENV" | "NEXT_PHASE" | "REMINDER_SCHEDULER", string>>;

/** The in-process scheduler runs in the production server unless switched off. */
export function shouldRunReminderScheduler(env: SchedulerEnv): boolean {
  if (env.NEXT_PHASE === "phase-production-build") return false;
  if (env.REMINDER_SCHEDULER === "off") return false;
  return env.NODE_ENV === "production" || env.REMINDER_SCHEDULER === "on";
}
