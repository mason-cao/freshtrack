import { afterEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());
const snapshotMock = vi.hoisted(() => vi.fn());
const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  })
);

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/db/admin-analytics", () => ({
  getAdminAnalyticsSnapshot: snapshotMock,
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  notFound: notFoundMock,
}));

import AdminAnalyticsPage from "./page";

const emptySnapshot = {
  generatedAt: "2026-07-27T20:00:00.000Z",
  activeWindowMinutes: 10,
  historyDays: 1,
  activeVisitors: 0,
  activeMembers: 0,
  totalUsers: 0,
  newUsersLast30Days: 0,
  totalStoredPageViews: 0,
  pageViewsLast30Days: 0,
  uniqueVisitorsLast30Days: 0,
  history: [
    {
      day: "2026-07-27",
      pageViews: 0,
      visitors: 0,
      registrations: 0,
    },
  ],
  topPages: [],
  accounts: [],
  accountListLimit: 100,
};

describe("admin analytics page access", () => {
  afterEach(() => {
    authMock.mockReset();
    snapshotMock.mockReset();
    notFoundMock.mockClear();
    vi.unstubAllEnvs();
  });

  it("hides analytics from signed-in users outside the allowlist", async () => {
    vi.stubEnv("ANALYTICS_ADMIN_EMAILS", "owner@example.com");
    authMock.mockResolvedValue({ user: { email: "other@example.com" } });

    await expect(AdminAnalyticsPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();
    expect(snapshotMock).not.toHaveBeenCalled();
  });

  it("loads analytics for a configured admin email", async () => {
    vi.stubEnv("ANALYTICS_ADMIN_EMAILS", "owner@example.com");
    authMock.mockResolvedValue({ user: { email: "OWNER@example.com" } });
    snapshotMock.mockResolvedValue(emptySnapshot);

    const page = await AdminAnalyticsPage();

    expect(snapshotMock).toHaveBeenCalledOnce();
    expect(page.type).toBe("div");
  });

  it("supports the separately opted-in local development bypass", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_DEV_BYPASS", "1");
    vi.stubEnv("ANALYTICS_ADMIN_DEV_BYPASS", "1");
    snapshotMock.mockResolvedValue(emptySnapshot);

    await AdminAnalyticsPage();

    expect(authMock).not.toHaveBeenCalled();
    expect(snapshotMock).toHaveBeenCalledOnce();
  });
});
