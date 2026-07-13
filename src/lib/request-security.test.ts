import { afterEach, describe, expect, it } from "vitest";
import { isSameOriginRequest } from "./request-security";

function requestWithHeaders(headers: Record<string, string>) {
  return new Request("https://freshtrack.up.railway.app/api/items", {
    method: "POST",
    headers,
  });
}

function proxiedRequestWithHeaders(headers: Record<string, string>) {
  return new Request("http://internal.railway/api/items", {
    method: "POST",
    headers,
  });
}

describe("isSameOriginRequest", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalAuthUrl = process.env.AUTH_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    process.env.AUTH_URL = originalAuthUrl;
  });

  it("allows requests with a matching origin", () => {
    expect(
      isSameOriginRequest(
        requestWithHeaders({ origin: "https://freshtrack.up.railway.app" })
      )
    ).toBe(true);
  });

  it("does not trust client-controlled host headers when the runtime URL is internal", () => {
    expect(
      isSameOriginRequest(
        proxiedRequestWithHeaders({
          origin: "https://freshtrack.up.railway.app",
          host: "freshtrack.up.railway.app",
          "x-forwarded-proto": "https",
        })
      )
    ).toBe(false);
  });

  it("does not trust client-controlled forwarded host headers", () => {
    expect(
      isSameOriginRequest(
        proxiedRequestWithHeaders({
          origin: "https://freshtrack.up.railway.app",
          host: "internal.railway",
          "x-forwarded-host": "freshtrack.up.railway.app",
          "x-forwarded-proto": "https",
        })
      )
    ).toBe(false);
  });

  it("allows the configured public site origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://freshtrack.up.railway.app";

    expect(
      isSameOriginRequest(
        proxiedRequestWithHeaders({
          origin: "https://freshtrack.up.railway.app",
          host: "internal.railway",
        })
      )
    ).toBe(true);
  });

  it("rejects requests with a different origin", () => {
    expect(
      isSameOriginRequest(requestWithHeaders({ origin: "https://evil.test" }))
    ).toBe(false);
  });

  it("does not let a matching request URL override configured origins", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://freshtrack.up.railway.app";

    expect(
      isSameOriginRequest(
        new Request("https://evil.test/api/items", {
          method: "POST",
          headers: { origin: "https://evil.test" },
        })
      )
    ).toBe(false);
  });

  it("falls back to the referer header when origin is absent", () => {
    expect(
      isSameOriginRequest(
        requestWithHeaders({
          referer: "https://freshtrack.up.railway.app/pantry",
        })
      )
    ).toBe(true);

    expect(
      isSameOriginRequest(
        requestWithHeaders({ referer: "https://evil.test/form" })
      )
    ).toBe(false);
  });

  it("allows requests without browser origin headers", () => {
    expect(isSameOriginRequest(requestWithHeaders({}))).toBe(true);
  });

  it("rejects requests without browser origin headers when required", () => {
    expect(
      isSameOriginRequest(requestWithHeaders({}), { requireOriginHeader: true })
    ).toBe(false);
  });
});
