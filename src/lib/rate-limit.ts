export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

interface RateLimitOptions {
  limit: number;
  windowMs: number;
  maxBuckets: number;
}

// Each process enforces its own limits; these buckets are not shared by replicas.
export function createRateLimiter(
  { limit, windowMs, maxBuckets }: RateLimitOptions,
  buckets = new Map<string, number[]>()
) {
  function makeRoom(windowStart: number) {
    for (const [key, timestamps] of buckets) {
      if ((timestamps.at(-1) ?? 0) <= windowStart) buckets.delete(key);
    }
    for (const key of buckets.keys()) {
      if (buckets.size < maxBuckets) break;
      buckets.delete(key);
    }
  }

  return (key: string, now = Date.now()): RateLimitResult => {
    const windowStart = now - windowMs;
    if (!buckets.has(key) && buckets.size >= maxBuckets) makeRoom(windowStart);

    const timestamps = (buckets.get(key) ?? []).filter((time) => time > windowStart);
    buckets.set(key, timestamps);
    if (timestamps.length >= limit) {
      return {
        ok: false,
        retryAfterSeconds: Math.max(1, Math.ceil((timestamps[0] + windowMs - now) / 1000)),
      };
    }
    timestamps.push(now);
    return { ok: true };
  };
}
