import { describe, expect, it } from "vitest";
import { checkProductLookupRateLimit, parseUpcItemDbName } from "./_lib";

describe("checkProductLookupRateLimit", () => {
  it("limits product lookups per user within a fixed window", () => {
    const userId = "lookup-rate-user";
    const now = Date.UTC(2026, 4, 13, 12, 0, 0);

    for (let i = 0; i < 30; i++) {
      expect(checkProductLookupRateLimit(userId, now + i).ok).toBe(true);
    }

    expect(checkProductLookupRateLimit(userId, now + 30)).toEqual({
      ok: false,
      retryAfterSeconds: 60,
    });

    expect(checkProductLookupRateLimit(userId, now + 60_001).ok).toBe(true);
  });
});

describe("parseUpcItemDbName", () => {
  it("returns the title of the first item", () => {
    expect(
      parseUpcItemDbName({
        code: "OK",
        total: 1,
        items: [{ title: "Clif Bar Chocolate Chip", brand: "Clif" }],
      })
    ).toBe("Clif Bar Chocolate Chip");
  });

  it("returns null for empty results, error codes, and junk", () => {
    expect(parseUpcItemDbName({ code: "OK", total: 0, items: [] })).toBeNull();
    expect(parseUpcItemDbName({ code: "INVALID_UPC" })).toBeNull();
    expect(parseUpcItemDbName({ items: [{ title: "   " }] })).toBeNull();
    expect(parseUpcItemDbName(null)).toBeNull();
    expect(parseUpcItemDbName("nope")).toBeNull();
  });
});
