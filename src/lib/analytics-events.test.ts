import { describe, expect, it } from "vitest";
import {
  ANALYTICS_EVENT_RATE_LIMIT,
  checkAnalyticsEventRateLimit,
  validateAnalyticsEventPayload,
} from "./analytics-events";

describe("analytics event validation", () => {
  it("normalizes a valid analytics payload", () => {
    const result = validateAnalyticsEventPayload({
      eventName: "page_view",
      visitorId: " visitor-123 ",
      path: "/?utm_source=reddit&utm_campaign=launch",
      referrer: "https://www.reddit.com/r/SideProject/",
      utmSource: " reddit ",
      utmMedium: "community",
      utmCampaign: "launch",
      utmContent: "sideproject",
      utmTerm: "",
    });

    expect(result).toEqual({
      ok: true,
      data: {
        eventName: "page_view",
        visitorId: "visitor-123",
        path: "/?utm_source=reddit&utm_campaign=launch",
        referrer: "https://www.reddit.com/r/SideProject/",
        utmSource: "reddit",
        utmMedium: "community",
        utmCampaign: "launch",
        utmContent: "sideproject",
        utmTerm: null,
      },
    });
  });

  it("rejects unknown events and oversized fields", () => {
    expect(validateAnalyticsEventPayload({ eventName: "anything" })).toEqual({
      ok: false,
      error: "Unsupported analytics event.",
    });

    expect(
      validateAnalyticsEventPayload({
        eventName: "page_view",
        visitorId: "v".repeat(129),
        path: "/",
      })
    ).toEqual({
      ok: false,
      error: "Visitor id must be 128 characters or fewer.",
    });

    expect(
      validateAnalyticsEventPayload({
        eventName: "page_view",
        visitorId: "visitor-123",
        path: "/" + "x".repeat(500),
      })
    ).toEqual({
      ok: false,
      error: "Path must be 500 characters or fewer.",
    });
  });

  it("limits analytics writes per visitor within a fixed window", () => {
    const key = "visitor-rate-limit";
    const now = Date.UTC(2026, 4, 27, 12, 0, 0);

    for (let i = 0; i < ANALYTICS_EVENT_RATE_LIMIT; i++) {
      expect(checkAnalyticsEventRateLimit(key, now + i).ok).toBe(true);
    }

    expect(checkAnalyticsEventRateLimit(key, now + 1000)).toEqual({
      ok: false,
      retryAfterSeconds: 59,
    });

    expect(checkAnalyticsEventRateLimit(key, now + 60_001).ok).toBe(true);
  });
});
