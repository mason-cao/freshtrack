// Pure shaping for the admin growth metrics: weekly active users, retention by
// sign-up week, and where sign-ups first arrived from.

const DAY_MS = 24 * 60 * 60 * 1_000;
const WEEK_MS = 7 * DAY_MS;

/** Weeks after sign-up shown in the retention table (week 0 is the join week). */
export const RETENTION_WEEK_OFFSETS = [1, 2, 3, 4, 5, 6];

export const DIRECT_SOURCE = "Direct or unknown";
export const NO_VISIT_DATA_SOURCE = "No visit data";
const OTHER_LABEL = "Other";
// The Google OAuth round trip is a sign-in bounce, not an acquisition source.
const IGNORED_REFERRER_HOSTS = new Set(["accounts.google.com"]);

export interface WeeklyActive {
  weekStart: string;
  activeUsers: number;
  /** Active users who joined before the week started. */
  returningUsers: number;
}

export interface RetentionCell {
  eligible: number;
  retained: number;
  percent: number | null;
}

export interface RetentionRow {
  cohortWeek: string;
  size: number;
  /** One entry per RETENTION_WEEK_OFFSETS; null until someone has completed that week. */
  weeks: (RetentionCell | null)[];
}

export interface SignupTouch {
  path: string | null;
  referrer: string | null;
  utmSource: string | null;
}

export interface RankedCount {
  label: string;
  signups: number;
}

export function percentOf(numerator: number, denominator: number): number | null {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : null;
}

function toDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Monday 00:00 UTC, matching Postgres date_trunc('week', ...). */
export function startOfUtcWeek(date: Date): Date {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (day.getUTCDay() + 6) % 7;
  return new Date(day.getTime() - daysSinceMonday * DAY_MS);
}

export function buildWeeklyActiveSeries(
  rows: WeeklyActive[],
  now: Date,
  weeks: number
): WeeklyActive[] {
  const byWeek = new Map(rows.map((row) => [row.weekStart, row]));
  const firstWeek = startOfUtcWeek(now).getTime() - (weeks - 1) * WEEK_MS;

  return Array.from({ length: weeks }, (_, index) => {
    const weekStart = toDay(new Date(firstWeek + index * WEEK_MS));
    const row = byWeek.get(weekStart);
    return {
      weekStart,
      activeUsers: row?.activeUsers ?? 0,
      returningUsers: row?.returningUsers ?? 0,
    };
  });
}

export function buildRetentionTable(
  cohorts: { cohortWeek: string; size: number }[],
  cells: { cohortWeek: string; weekOffset: number; eligible: number; retained: number }[],
  offsets = RETENTION_WEEK_OFFSETS
): RetentionRow[] {
  const cellByKey = new Map(cells.map((cell) => [`${cell.cohortWeek}:${cell.weekOffset}`, cell]));

  return [...cohorts]
    .sort((a, b) => a.cohortWeek.localeCompare(b.cohortWeek))
    .map((cohort) => ({
      cohortWeek: cohort.cohortWeek,
      size: cohort.size,
      weeks: offsets.map((offset) => {
        const cell = cellByKey.get(`${cohort.cohortWeek}:${offset}`);
        if (!cell || cell.eligible <= 0) return null;
        return {
          eligible: cell.eligible,
          retained: cell.retained,
          percent: percentOf(cell.retained, cell.eligible),
        };
      }),
    }));
}

/** Ordered shade step (0-6) for a retention percentage. */
export function retentionShade(percent: number): number {
  if (percent <= 0) return 0;
  if (percent < 15) return 1;
  if (percent < 30) return 2;
  if (percent < 45) return 3;
  if (percent < 60) return 4;
  if (percent < 80) return 5;
  return 6;
}

function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Where a sign-up first arrived from: campaign tag, then referring site. */
export function classifySignupSource(touch: SignupTouch | null, ownHosts: string[]): string {
  if (!touch) return NO_VISIT_DATA_SOURCE;

  const campaign = touch.utmSource?.trim().toLowerCase();
  if (campaign) return campaign;

  const host = referrerHost(touch.referrer);
  if (!host || ownHosts.includes(host) || IGNORED_REFERRER_HOSTS.has(host)) {
    return DIRECT_SOURCE;
  }
  return host;
}

function rank(counts: Map<string, number>, limit: number): RankedCount[] {
  const ranked = [...counts.entries()]
    .map(([label, signups]) => ({ label, signups }))
    .sort((a, b) => b.signups - a.signups || a.label.localeCompare(b.label, "en"));
  if (ranked.length <= limit) return ranked;

  const otherSignups = ranked.slice(limit).reduce((sum, entry) => sum + entry.signups, 0);
  return [...ranked.slice(0, limit), { label: OTHER_LABEL, signups: otherSignups }];
}

export function summarizeSignupTouches(
  touches: (SignupTouch | null)[],
  ownHosts: string[],
  limit = 8
) {
  const sources = new Map<string, number>();
  const landingPages = new Map<string, number>();

  for (const touch of touches) {
    const source = classifySignupSource(touch, ownHosts);
    sources.set(source, (sources.get(source) ?? 0) + 1);
    if (touch?.path) landingPages.set(touch.path, (landingPages.get(touch.path) ?? 0) + 1);
  }

  return { sources: rank(sources, limit), landingPages: rank(landingPages, limit) };
}

/** A clean axis ceiling (1, 2, 4, 5, 8, or 10 times a power of ten) at or above value. */
export function niceAxisMax(value: number): number {
  if (value <= 1) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 4, 5, 8, 10].find((candidate) => candidate * magnitude >= value) ?? 10;
  return step * magnitude;
}
