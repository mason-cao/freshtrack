import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  inArray,
  max,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import { analyticsEvents, users } from "@/db/schema";
import {
  ANALYTICS_ACTIVE_WINDOW_MINUTES,
  ANALYTICS_HISTORY_DAYS,
  analyticsHistoryStart,
  buildDailyAnalyticsHistory,
  type DailyAnalyticsHistory,
} from "@/lib/admin-analytics";

const ACTIVE_EVENT_NAMES = ["page_view", "active_ping"];
const MAX_LISTED_ACCOUNTS = 100;
const TOP_PAGE_LIMIT = 10;

export interface AnalyticsTopPage {
  path: string;
  pageViews: number;
  visitors: number;
}

export interface AnalyticsAccount {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  lastSeenAt: string | null;
}

export interface AdminAnalyticsSnapshot {
  generatedAt: string;
  activeWindowMinutes: number;
  historyDays: number;
  activeVisitors: number;
  activeMembers: number;
  totalUsers: number;
  newUsersLast30Days: number;
  totalStoredPageViews: number;
  pageViewsLast30Days: number;
  uniqueVisitorsLast30Days: number;
  history: DailyAnalyticsHistory[];
  topPages: AnalyticsTopPage[];
  accounts: AnalyticsAccount[];
  accountListLimit: number;
}

export async function getAdminAnalyticsSnapshot(
  now = new Date()
): Promise<AdminAnalyticsSnapshot> {
  const activeSince = new Date(
    now.getTime() - ANALYTICS_ACTIVE_WINDOW_MINUTES * 60 * 1_000
  ).toISOString();
  const historySince = analyticsHistoryStart(
    now,
    ANALYTICS_HISTORY_DAYS
  ).toISOString();

  const trafficDay = sql<string>`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`;
  const registrationDay = sql<string>`to_char(${users.createdAt}, 'YYYY-MM-DD')`;
  const pageViewCount = count(analyticsEvents.id);
  const pageVisitorCount = countDistinct(analyticsEvents.visitorId);

  const [
    activeRows,
    trafficSummaryRows,
    userSummaryRows,
    dailyTrafficRows,
    dailyRegistrationRows,
    topPages,
    accounts,
  ] = await Promise.all([
    db
      .select({
        activeVisitors: countDistinct(analyticsEvents.visitorId),
        activeMembers: countDistinct(analyticsEvents.userId),
      })
      .from(analyticsEvents)
      .where(
        and(
          inArray(analyticsEvents.eventName, ACTIVE_EVENT_NAMES),
          gte(analyticsEvents.createdAt, activeSince)
        )
      ),
    db
      .select({
        totalStoredPageViews: count(analyticsEvents.id),
        pageViewsLast30Days:
          sql<number>`count(*) filter (where ${analyticsEvents.createdAt} >= ${historySince})`.mapWith(
            Number
          ),
        uniqueVisitorsLast30Days:
          sql<number>`count(distinct ${analyticsEvents.visitorId}) filter (where ${analyticsEvents.createdAt} >= ${historySince})`.mapWith(
            Number
          ),
      })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.eventName, "page_view")),
    db
      .select({
        totalUsers: count(users.id),
        newUsersLast30Days:
          sql<number>`count(*) filter (where ${users.createdAt} >= ${historySince})`.mapWith(
            Number
          ),
      })
      .from(users),
    db
      .select({
        day: trafficDay,
        pageViews: pageViewCount,
        visitors: pageVisitorCount,
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventName, "page_view"),
          gte(analyticsEvents.createdAt, historySince)
        )
      )
      .groupBy(trafficDay)
      .orderBy(trafficDay),
    db
      .select({
        day: registrationDay,
        registrations: count(users.id),
      })
      .from(users)
      .where(gte(users.createdAt, historySince))
      .groupBy(registrationDay)
      .orderBy(registrationDay),
    db
      .select({
        path: analyticsEvents.path,
        pageViews: pageViewCount,
        visitors: pageVisitorCount,
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventName, "page_view"),
          gte(analyticsEvents.createdAt, historySince)
        )
      )
      .groupBy(analyticsEvents.path)
      .orderBy(desc(pageViewCount), analyticsEvents.path)
      .limit(TOP_PAGE_LIMIT),
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
        lastSeenAt: max(analyticsEvents.createdAt),
      })
      .from(users)
      .leftJoin(
        analyticsEvents,
        and(
          eq(users.id, analyticsEvents.userId),
          inArray(analyticsEvents.eventName, ACTIVE_EVENT_NAMES)
        )
      )
      .groupBy(users.id, users.email, users.name, users.createdAt)
      .orderBy(desc(users.createdAt))
      .limit(MAX_LISTED_ACCOUNTS),
  ]);

  const active = activeRows[0];
  const trafficSummary = trafficSummaryRows[0];
  const userSummary = userSummaryRows[0];

  return {
    generatedAt: now.toISOString(),
    activeWindowMinutes: ANALYTICS_ACTIVE_WINDOW_MINUTES,
    historyDays: ANALYTICS_HISTORY_DAYS,
    activeVisitors: active?.activeVisitors ?? 0,
    activeMembers: active?.activeMembers ?? 0,
    totalUsers: userSummary?.totalUsers ?? 0,
    newUsersLast30Days: userSummary?.newUsersLast30Days ?? 0,
    totalStoredPageViews: trafficSummary?.totalStoredPageViews ?? 0,
    pageViewsLast30Days: trafficSummary?.pageViewsLast30Days ?? 0,
    uniqueVisitorsLast30Days:
      trafficSummary?.uniqueVisitorsLast30Days ?? 0,
    history: buildDailyAnalyticsHistory(
      dailyTrafficRows,
      dailyRegistrationRows,
      now,
      ANALYTICS_HISTORY_DAYS
    ),
    topPages,
    accounts,
    accountListLimit: MAX_LISTED_ACCOUNTS,
  };
}
