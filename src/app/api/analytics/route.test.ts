import { describe, expect, it, vi, beforeEach } from "vitest";

const dbMock = vi.hoisted(() => ({
  insert: vi.fn(),
}));

const authMock = vi.hoisted(() => vi.fn());

vi.mock("@/db", () => ({
  db: dbMock,
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

import { POST } from "./route";

function analyticsRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://freshtrack.up.railway.app/api/analytics", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://freshtrack.up.railway.app",
      "user-agent": "Vitest",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analytics", () => {
  beforeEach(() => {
    dbMock.insert.mockReset();
    authMock.mockReset();
  });

  it("stores a valid same-origin analytics event with the current user id", async () => {
    const insertValues = vi.fn(async () => undefined);
    dbMock.insert.mockReturnValue({ values: insertValues });
    authMock.mockResolvedValue({ user: { id: "user_123" } });

    const response = await POST(
      analyticsRequest({
        eventName: "page_view",
        visitorId: "route-test-visitor",
        path: "/?utm_source=reddit",
        referrer: "https://www.reddit.com/r/SideProject/",
        utmSource: "reddit",
        utmMedium: "community",
        utmCampaign: "launch",
        utmContent: "sideproject",
      })
    );

    expect(response.status).toBe(204);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "page_view",
        visitorId: "route-test-visitor",
        path: "/?utm_source=reddit",
        referrer: "https://www.reddit.com/r/SideProject/",
        utmSource: "reddit",
        utmMedium: "community",
        utmCampaign: "launch",
        utmContent: "sideproject",
        userId: "user_123",
        userAgent: "Vitest",
      })
    );
  });

  it("rejects cross-origin analytics posts before writing", async () => {
    const insertValues = vi.fn(async () => undefined);
    dbMock.insert.mockReturnValue({ values: insertValues });

    const response = await POST(
      analyticsRequest(
        {
          eventName: "page_view",
          visitorId: "cross-origin-visitor",
          path: "/",
        },
        { origin: "https://evil.test" }
      )
    );

    expect(response.status).toBe(403);
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects public analytics posts without browser origin headers", async () => {
    const insertValues = vi.fn(async () => undefined);
    dbMock.insert.mockReturnValue({ values: insertValues });

    const response = await POST(
      analyticsRequest(
        {
          eventName: "page_view",
          visitorId: "missing-origin-visitor",
          path: "/",
        },
        { origin: "", referer: "" }
      )
    );

    expect(response.status).toBe(403);
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rate limits analytics by client address even when visitor ids change", async () => {
    const insertValues = vi.fn(async () => undefined);
    dbMock.insert.mockReturnValue({ values: insertValues });

    let response: Response | null = null;
    for (let i = 0; i < 121; i++) {
      response = await POST(
        analyticsRequest(
          {
            eventName: "page_view",
            visitorId: `forged-visitor-${i}`,
            path: "/",
          },
          { "x-forwarded-for": "203.0.113.10" }
        )
      );
    }

    expect(response?.status).toBe(429);
  });
});
