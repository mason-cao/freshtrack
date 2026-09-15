import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("sliding-window rate limits", () => {
  it("expires requests at the boundary and does not extend the window on rejection", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 2000, maxBuckets: 10 });
    expect(check("a", 1000).ok).toBe(true);
    expect(check("a", 1500).ok).toBe(true);
    expect(check("a", 2000)).toEqual({ ok: false, retryAfterSeconds: 1 });
    expect(check("b", 2000).ok).toBe(true);
    expect(check("a", 2999).ok).toBe(false);
    expect(check("a", 3000).ok).toBe(true);
    expect(check("a", 3500).ok).toBe(true);
  });

  it("bounds storage and removes expired buckets before active buckets", () => {
    const buckets = new Map<string, number[]>();
    const check = createRateLimiter({ limit: 1, windowMs: 1000, maxBuckets: 2 }, buckets);
    check("expired", 1);
    check("active", 501);
    check("new", 1001);
    expect([...buckets.keys()]).toEqual(["active", "new"]);
    expect(check("active", 1001).ok).toBe(false);
    check("overflow", 1002);
    expect(buckets.size).toBe(2);
  });

  it("keeps policies independent even for the same user", () => {
    const options = { limit: 1, windowMs: 1000, maxBuckets: 2 };
    const items = createRateLimiter(options);
    const products = createRateLimiter(options);
    items("user", 1);
    expect(items("user", 2).ok).toBe(false);
    expect(products("user", 2).ok).toBe(true);
  });
});
