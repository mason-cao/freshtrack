import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildAnalyticsPayload,
  extractUtmAttribution,
  mergeAttribution,
  trackAnalyticsEvent,
} from "./analytics-client";

describe("analytics client attribution", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("extracts UTM values from URL search params", () => {
    const attribution = extractUtmAttribution(
      new URLSearchParams(
        "utm_source=reddit&utm_medium=community&utm_campaign=launch&utm_content=sideproject&utm_term=pantry"
      )
    );

    expect(attribution).toEqual({
      utmSource: "reddit",
      utmMedium: "community",
      utmCampaign: "launch",
      utmContent: "sideproject",
      utmTerm: "pantry",
    });
  });

  it("prefers current UTM values and falls back to stored attribution", () => {
    expect(
      mergeAttribution(
        { utmSource: "reddit", utmCampaign: "launch" },
        { utmSource: "hackernews", utmMedium: "community", utmCampaign: "old" }
      )
    ).toEqual({
      utmSource: "reddit",
      utmMedium: "community",
      utmCampaign: "launch",
      utmContent: null,
      utmTerm: null,
    });
  });

  it("builds the analytics payload shape sent to the ingest route", () => {
    expect(
      buildAnalyticsPayload({
        eventName: "sign_in_clicked",
        visitorId: "visitor-123",
        path: "/?utm_source=reddit",
        referrer: "https://www.reddit.com/",
        attribution: { utmSource: "reddit", utmCampaign: "launch" },
      })
    ).toEqual({
      eventName: "sign_in_clicked",
      visitorId: "visitor-123",
      path: "/?utm_source=reddit",
      referrer: "https://www.reddit.com/",
      utmSource: "reddit",
      utmMedium: null,
      utmCampaign: "launch",
      utmContent: null,
      utmTerm: null,
    });
  });

  it("does not throw when browser storage is unavailable", () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));

    vi.stubGlobal("window", {
      location: { pathname: "/", search: "?utm_source=reddit" },
      localStorage: {
        getItem: vi.fn(() => {
          throw new Error("Storage unavailable");
        }),
        setItem: vi.fn(() => {
          throw new Error("Storage unavailable");
        }),
      },
      crypto: { randomUUID: () => "visitor-fallback" },
    });
    vi.stubGlobal("document", { referrer: "" });
    vi.stubGlobal("fetch", fetchMock);

    expect(() => trackAnalyticsEvent("page_view")).not.toThrow();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/analytics",
      expect.objectContaining({
        body: expect.stringContaining('"visitorId":"visitor-fallback"'),
      })
    );
  });
});
