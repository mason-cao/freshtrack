import { describe, expect, it } from "vitest";
import {
  analyticsHistoryStart,
  buildDailyAnalyticsHistory,
  isAnalyticsAdminEmail,
  isAnalyticsAdminDevBypassEnabled,
  parseAnalyticsAdminEmails,
} from "./admin-analytics";

describe("analytics admin access", () => {
  it("normalizes and deduplicates configured admin emails", () => {
    expect(
      parseAnalyticsAdminEmails(
        " Owner@Example.com, second@example.com;owner@example.com\nthird@example.com "
      )
    ).toEqual([
      "owner@example.com",
      "second@example.com",
      "third@example.com",
    ]);
  });

  it("allows only exact configured email matches", () => {
    const configured = "owner@example.com,second@example.com";

    expect(isAnalyticsAdminEmail("OWNER@example.com", configured)).toBe(true);
    expect(isAnalyticsAdminEmail("attacker+owner@example.com", configured)).toBe(
      false
    );
    expect(isAnalyticsAdminEmail(null, configured)).toBe(false);
    expect(isAnalyticsAdminEmail("owner@example.com", "")).toBe(false);
  });

  it("allows the admin bypass only in an explicitly opted-in development server", () => {
    expect(
      isAnalyticsAdminDevBypassEnabled({
        NODE_ENV: "development",
        AUTH_DEV_BYPASS: "1",
        ANALYTICS_ADMIN_DEV_BYPASS: "1",
      })
    ).toBe(true);
    expect(
      isAnalyticsAdminDevBypassEnabled({
        NODE_ENV: "production",
        AUTH_DEV_BYPASS: "1",
        ANALYTICS_ADMIN_DEV_BYPASS: "1",
      })
    ).toBe(false);
    expect(
      isAnalyticsAdminDevBypassEnabled({
        NODE_ENV: "development",
        AUTH_DEV_BYPASS: "1",
      })
    ).toBe(false);
  });
});

describe("daily analytics history", () => {
  it("starts at the beginning of the inclusive UTC window", () => {
    expect(
      analyticsHistoryStart(new Date("2026-07-27T22:15:00.000Z"), 3).toISOString()
    ).toBe("2026-07-25T00:00:00.000Z");
  });

  it("fills missing dates and combines traffic with registrations", () => {
    expect(
      buildDailyAnalyticsHistory(
        [
          { day: "2026-07-25", pageViews: 7, visitors: 4 },
          { day: "2026-07-27", pageViews: 11, visitors: 6 },
        ],
        [
          { day: "2026-07-26", registrations: 2 },
          { day: "2026-07-27", registrations: 1 },
        ],
        new Date("2026-07-27T22:15:00.000Z"),
        3
      )
    ).toEqual([
      {
        day: "2026-07-25",
        pageViews: 7,
        visitors: 4,
        registrations: 0,
      },
      {
        day: "2026-07-26",
        pageViews: 0,
        visitors: 0,
        registrations: 2,
      },
      {
        day: "2026-07-27",
        pageViews: 11,
        visitors: 6,
        registrations: 1,
      },
    ]);
  });
});
