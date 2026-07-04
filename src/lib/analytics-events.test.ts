import { describe, expect, it } from "vitest";
import {
  ANALYTICS_EVENT_RATE_LIMIT,
  MAX_ANALYTICS_RATE_LIMIT_BUCKETS,
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

  it("accepts the barcode scanning events", () => {
    for (const eventName of ["barcode_scanned", "barcode_lookup_hit", "barcode_lookup_miss"]) {
      const result = validateAnalyticsEventPayload({ eventName, visitorId: "visitor-123", path: "/app" });
      expect(result.ok).toBe(true);
    }
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

  it("keeps the bucket map bounded when flooded with unique keys", () => {
    const now = Date.UTC(2026, 4, 27, 12, 0, 0);

    for (let i = 0; i < MAX_ANALYTICS_RATE_LIMIT_BUCKETS + 500; i++) {
      expect(checkAnalyticsEventRateLimit(`flood-${i}`, now).ok).toBe(true);
    }

    // A brand-new key an hour later must still be accepted, and stale flood
    // buckets must have been evicted rather than accumulating forever.
    const later = now + 60 * 60 * 1000;
    expect(checkAnalyticsEventRateLimit("post-flood-visitor", later).ok).toBe(true);

    const globalBuckets = (
      globalThis as unknown as {
        freshtrackAnalyticsEventBuckets?: Map<string, number[]>;
      }
    ).freshtrackAnalyticsEventBuckets;
    expect(globalBuckets).toBeDefined();
    expect(globalBuckets!.size).toBeLessThanOrEqual(MAX_ANALYTICS_RATE_LIMIT_BUCKETS);
  });
});
