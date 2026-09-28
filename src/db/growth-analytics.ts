import { sql } from "drizzle-orm";
import { db } from "@/db";
import { analyticsHistoryStart, ANALYTICS_HISTORY_DAYS } from "@/lib/admin-analytics";
import {
  RETENTION_WEEK_OFFSETS,
  buildRetentionTable,
  buildWeeklyActiveSeries,
  startOfUtcWeek,
  summarizeSignupTouches,
  type RankedCount,
  type RetentionRow,
  type SignupTouch,
  type WeeklyActive,
} from "@/lib/growth-analytics";
import { LEGACY_SITE_HOST, PRODUCTION_SITE_URL, siteUrl } from "@/lib/site-url";

const WEEKLY_ACTIVE_WEEKS = 12;
const RETENTION_COHORT_WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1_000;

export interface ActivationFunnel {
  signedUp: number;
  addedItem: number;
  addedFiveItems: number;
  loggedOutcome: number;
  /** Sign-ups old enough (8+ days) to have had a full first week. */
  week1Eligible: number;
  returnedWeek1: number;
}

export interface GrowthSnapshot {
  cohortDays: number;
  funnel: ActivationFunnel;
  weeklyActive: WeeklyActive[];
  retention: RetentionRow[];
  signupSources: RankedCount[];
  signupLandingPages: RankedCount[];
}

// A signed-in user counts as active whenever they load a page, add or change
// an item, or log one as used or wasted. Pantry writes are included so users
// whose browser blocks the analytics request still count.
const activity = sql`
  select user_id, created_at as at from analytics_events where user_id is not null
  union all select user_id, created_at from items
  union all select user_id, updated_at from items where updated_at > created_at
  union all select user_id, logged_at from waste_log
`;

function timestamp(date: Date) {
  return sql`${date.toISOString()}::timestamp`;
}

async function rows<T>(query: ReturnType<typeof sql>): Promise<T[]> {
  return (await db.execute(query)) as unknown as T[];
}

async function getActivationFunnel(since: Date, now: Date): Promise<ActivationFunnel> {
  const [row] = await rows<ActivationFunnel>(sql`
    with activity as (${activity}),
    cohort as (
      select id, created_at from users where created_at >= ${timestamp(since)}
    ),
    item_counts as (
      select user_id, count(*)::int as n from items
      where user_id in (select id from cohort) group by user_id
    ),
    logged as (
      select distinct user_id from waste_log where user_id in (select id from cohort)
    )
    select
      count(*)::int as "signedUp",
      count(*) filter (where coalesce(ic.n, 0) >= 1 or l.user_id is not null)::int as "addedItem",
      count(*) filter (where coalesce(ic.n, 0) >= 5)::int as "addedFiveItems",
      count(*) filter (where l.user_id is not null)::int as "loggedOutcome",
      count(*) filter (
        where c.created_at <= ${timestamp(now)} - interval '8 days'
      )::int as "week1Eligible",
      count(*) filter (
        where c.created_at <= ${timestamp(now)} - interval '8 days'
          and exists (
            select 1 from activity a
            where a.user_id = c.id
              and a.at >= date_trunc('day', c.created_at) + interval '1 day'
              and a.at < c.created_at + interval '8 days'
          )
      )::int as "returnedWeek1"
    from cohort c
    left join item_counts ic on ic.user_id = c.id
    left join logged l on l.user_id = c.id
  `);
  return row;
}

async function getWeeklyActive(now: Date): Promise<WeeklyActive[]> {
  const firstWeek = new Date(startOfUtcWeek(now).getTime() - (WEEKLY_ACTIVE_WEEKS - 1) * WEEK_MS);
  const weekly = await rows<WeeklyActive>(sql`
    with activity as (${activity}),
    weekly as (
      select date_trunc('week', at) as week, user_id from activity
      where at >= ${timestamp(firstWeek)}
      group by 1, 2
    )
    select
      to_char(w.week, 'YYYY-MM-DD') as "weekStart",
      count(*)::int as "activeUsers",
      count(*) filter (where u.created_at < w.week)::int as "returningUsers"
    from weekly w
    join users u on u.id = w.user_id
    group by w.week
    order by w.week
  `);
  return buildWeeklyActiveSeries(weekly, now, WEEKLY_ACTIVE_WEEKS);
}

async function getRetention(now: Date): Promise<RetentionRow[]> {
  const currentWeek = startOfUtcWeek(now);
  const cohortStart = new Date(currentWeek.getTime() - RETENTION_COHORT_WEEKS * WEEK_MS);
  const cohort = sql`
    select id as user_id, created_at, to_char(date_trunc('week', created_at), 'YYYY-MM-DD') as cohort_week
    from users
    where created_at >= ${timestamp(cohortStart)} and created_at < ${timestamp(currentWeek)}
  `;
  const maxOffset = Math.max(...RETENTION_WEEK_OFFSETS);

  const [cohorts, cells] = await Promise.all([
    rows<{ cohortWeek: string; size: number }>(sql`
      with cohort as (${cohort})
      select cohort_week as "cohortWeek", count(*)::int as size from cohort group by 1
    `),
    // A member counts toward week k only once they have fully lived through it.
    rows<{ cohortWeek: string; weekOffset: number; eligible: number; retained: number }>(sql`
      with activity as (${activity}),
      cohort as (${cohort}),
      cells as (
        select c.cohort_week, o.k, c.user_id, c.created_at
        from cohort c
        cross join generate_series(1, ${maxOffset}::int) as o(k)
        where c.created_at + (o.k + 1) * interval '7 days' <= ${timestamp(now)}
      )
      select
        cohort_week as "cohortWeek",
        k as "weekOffset",
        count(*)::int as eligible,
        count(*) filter (
          where exists (
            select 1 from activity a
            where a.user_id = cells.user_id
              and a.at >= cells.created_at + cells.k * interval '7 days'
              and a.at < cells.created_at + (cells.k + 1) * interval '7 days'
          )
        )::int as retained
      from cells
      group by 1, 2
    `),
  ]);

  return buildRetentionTable(cohorts, cells);
}

async function getSignupTouches(since: Date): Promise<(SignupTouch | null)[]> {
  // First recorded visit from any browser the user has signed in on.
  const touches = await rows<{ hasVisit: boolean } & SignupTouch>(sql`
    select
      ft.path is not null as "hasVisit",
      ft.path,
      ft.referrer,
      ft.utm_source as "utmSource"
    from users u
    left join lateral (
      select e.path, e.referrer, e.utm_source
      from analytics_events e
      where e.visitor_id in (
        select distinct v.visitor_id from analytics_events v where v.user_id = u.id
      )
      order by e.created_at asc, e.id asc
      limit 1
    ) ft on true
    where u.created_at >= ${timestamp(since)}
  `);
  return touches.map(({ hasVisit, path, referrer, utmSource }) =>
    hasVisit ? { path, referrer, utmSource } : null
  );
}

function ownHostnames(): string[] {
  return [siteUrl, PRODUCTION_SITE_URL]
    .map((url) => new URL(url).hostname.replace(/^www\./, ""))
    .concat(LEGACY_SITE_HOST);
}

export async function getGrowthSnapshot(now = new Date()): Promise<GrowthSnapshot> {
  const since = analyticsHistoryStart(now, ANALYTICS_HISTORY_DAYS);
  const [funnel, weeklyActive, retention, touches] = await Promise.all([
    getActivationFunnel(since, now),
    getWeeklyActive(now),
    getRetention(now),
    getSignupTouches(since),
  ]);
  const { sources, landingPages } = summarizeSignupTouches(touches, ownHostnames());

  return {
    cohortDays: ANALYTICS_HISTORY_DAYS,
    funnel,
    weeklyActive,
    retention,
    signupSources: sources,
    signupLandingPages: landingPages,
  };
}
