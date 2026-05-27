import { describe, expect, it } from "vitest";
import { isPublicPath } from "./route-access";

describe("isPublicPath", () => {
  it("allows public marketing, auth, and legal routes", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/privacy")).toBe(true);
    expect(isPublicPath("/terms")).toBe(true);
    expect(isPublicPath("/api/auth/signin")).toBe(true);
    expect(isPublicPath("/api/analytics")).toBe(true);
    expect(isPublicPath("/opengraph-image")).toBe(true);
    expect(isPublicPath("/twitter-image")).toBe(true);
    expect(isPublicPath("/foods")).toBe(true);
    expect(isPublicPath("/foods/avocado")).toBe(true);
  });

  it("keeps app and data routes protected", () => {
    expect(isPublicPath("/app")).toBe(false);
    expect(isPublicPath("/pantry")).toBe(false);
    expect(isPublicPath("/api/items")).toBe(false);
    expect(isPublicPath("/api/analytics/export")).toBe(false);
  });
});
