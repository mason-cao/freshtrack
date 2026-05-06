import { describe, expect, it } from "vitest";
import { isPublicPath } from "./route-access";

describe("isPublicPath", () => {
  it("allows public auth and legal routes", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/privacy")).toBe(true);
    expect(isPublicPath("/terms")).toBe(true);
    expect(isPublicPath("/api/auth/signin")).toBe(true);
  });

  it("keeps app and data routes protected", () => {
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/pantry")).toBe(false);
    expect(isPublicPath("/api/items")).toBe(false);
  });
});
