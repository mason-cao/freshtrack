import { describe, expect, it } from "vitest";
import { createUnsubscribeToken, verifyUnsubscribeToken } from "./unsubscribe-token";

const SECRET = "test-secret-for-unsubscribe-links";

describe("unsubscribe tokens", () => {
  it("round-trips the user id", () => {
    const token = createUnsubscribeToken("0b7c1f2e-9d4a-4c5e-8f00-123456789abc", SECRET);
    expect(verifyUnsubscribeToken(token, SECRET)).toBe("0b7c1f2e-9d4a-4c5e-8f00-123456789abc");
  });

  it("is URL-safe", () => {
    expect(createUnsubscribeToken("user.with/odd+chars", SECRET)).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(
      verifyUnsubscribeToken(createUnsubscribeToken("user.with/odd+chars", SECRET), SECRET)
    ).toBe("user.with/odd+chars");
  });

  it("rejects tampered, re-targeted, or foreign-secret tokens", () => {
    const token = createUnsubscribeToken("user-a", SECRET);
    const [, signature] = token.split(".");
    const retargeted = `${Buffer.from("user-b").toString("base64url")}.${signature}`;

    expect(verifyUnsubscribeToken(retargeted, SECRET)).toBeNull();
    expect(verifyUnsubscribeToken(`${token}x`, SECRET)).toBeNull();
    expect(verifyUnsubscribeToken(token, "a-different-secret")).toBeNull();
  });

  it("rejects malformed input", () => {
    for (const token of ["", "no-dot", ".", "a.", ".b", "a.b.c", null, undefined]) {
      expect(verifyUnsubscribeToken(token, SECRET)).toBeNull();
    }
  });
});
