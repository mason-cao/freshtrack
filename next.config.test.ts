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
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ])
    );
  });
});
