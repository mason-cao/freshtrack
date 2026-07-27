export const ANALYTICS_ACTIVE_WINDOW_MINUTES = 10;
export const ANALYTICS_HISTORY_DAYS = 30;

export interface DailyTrafficRow {
  day: string;
  pageViews: number;
  visitors: number;
}

export interface DailyRegistrationRow {
  day: string;
  registrations: number;
}

export interface DailyAnalyticsHistory {
  day: string;
  pageViews: number;
  visitors: number;
  registrations: number;
}

interface AnalyticsAdminEnvironment {
  NODE_ENV?: string;
  AUTH_DEV_BYPASS?: string;
  ANALYTICS_ADMIN_DEV_BYPASS?: string;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function parseAnalyticsAdminEmails(value: string | undefined): string[] {
  if (!value) return [];

  return Array.from(
    new Set(
      value
        .split(/[;,\n]/)
        .map(normalizeEmail)
        .filter(Boolean)
    )
  );
}

export function isAnalyticsAdminEmail(
  email: string | null | undefined,
  configuredEmails = process.env.ANALYTICS_ADMIN_EMAILS
): boolean {
  if (!email) return false;
  return parseAnalyticsAdminEmails(configuredEmails).includes(
    normalizeEmail(email)
  );
}

export function isAnalyticsAdminDevBypassEnabled(
  environment: AnalyticsAdminEnvironment = process.env
): boolean {
  return (
    environment.NODE_ENV === "development" &&
    environment.AUTH_DEV_BYPASS === "1" &&
    environment.ANALYTICS_ADMIN_DEV_BYPASS === "1"
  );
}

export function analyticsHistoryStart(
  now: Date,
  days = ANALYTICS_HISTORY_DAYS
): Date {
  const normalizedDays = Math.max(1, Math.floor(days));
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  start.setUTCDate(start.getUTCDate() - (normalizedDays - 1));
  return start;
}

function nonNegativeNumber(value: number | undefined): number {
  return Math.max(0, Number(value) || 0);
}

export function buildDailyAnalyticsHistory(
  trafficRows: DailyTrafficRow[],
  registrationRows: DailyRegistrationRow[],
  now: Date,
  days = ANALYTICS_HISTORY_DAYS
): DailyAnalyticsHistory[] {
  const normalizedDays = Math.max(1, Math.floor(days));
  const trafficByDay = new Map(trafficRows.map((row) => [row.day, row]));
  const registrationsByDay = new Map(
    registrationRows.map((row) => [row.day, row.registrations])
  );
  const start = analyticsHistoryStart(now, normalizedDays);

  return Array.from({ length: normalizedDays }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const day = date.toISOString().slice(0, 10);
    const traffic = trafficByDay.get(day);

    return {
      day,
      pageViews: nonNegativeNumber(traffic?.pageViews),
      visitors: nonNegativeNumber(traffic?.visitors),
      registrations: nonNegativeNumber(registrationsByDay.get(day)),
    };
  });
}
