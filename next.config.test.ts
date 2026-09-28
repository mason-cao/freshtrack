import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("next security config", () => {
  it("disables the x-powered-by header", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("sets baseline security headers for every route", async () => {
    expect(nextConfig.headers).toBeTypeOf("function");
    const headers = await nextConfig.headers!();
    const globalHeaders = headers.find((entry) => entry.source === "/(.*)")?.headers;

    expect(globalHeaders).toEqual(
      expect.arrayContaining([
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ])
    );
    expect(globalHeaders).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "Content-Security-Policy" }),
      ])
    );
  });
});

describe("legacy domain redirect", () => {
  it("permanently redirects every path on the old Railway domain to myfreshtrack.app", async () => {
    expect(nextConfig.redirects).toBeTypeOf("function");
    const redirects = await nextConfig.redirects!();

    expect(redirects).toContainEqual({
      source: "/:path*",
      has: [{ type: "host", value: "freshtrack.up.railway.app" }],
      destination: "https://myfreshtrack.app/:path*",
      permanent: true,
    });
  });

  it("only redirects requests for the old host", async () => {
    const redirects = await nextConfig.redirects!();
    for (const redirect of redirects) {
      expect(redirect.has).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: "host" })])
      );
    }
  });
});
