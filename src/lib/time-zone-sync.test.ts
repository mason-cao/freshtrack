// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncBrowserTimeZone } from "./time-zone-sync";

describe("syncBrowserTimeZone", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
      timeZone: "Europe/London",
    } as Intl.ResolvedDateTimeFormatOptions);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sends the browser's zone once per session", async () => {
    const fetchMock = vi.fn(async () => Response.json({ timeZone: "Europe/London" }));
    vi.stubGlobal("fetch", fetchMock);

    await syncBrowserTimeZone();
    await syncBrowserTimeZone();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/api/account/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeZone: "Europe/London" }),
    });
  });

  it("tries again next time when the request fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(Response.json({ timeZone: "Europe/London" }));
    vi.stubGlobal("fetch", fetchMock);

    await syncBrowserTimeZone();
    await syncBrowserTimeZone();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("never throws, even when the network is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));
    await expect(syncBrowserTimeZone()).resolves.toBeUndefined();
  });
});
