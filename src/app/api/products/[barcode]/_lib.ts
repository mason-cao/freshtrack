// Helpers for the product-lookup route: a per-user rate limit (so scanning
// can't hammer the upstream free APIs) and a pure parser for the UPCitemdb
// secondary lookup. The rate-limit bucket mirrors checkItemMutationRateLimit
// in ../../items/_lib.ts.

export const PRODUCT_LOOKUP_RATE_LIMIT = 30;
export const PRODUCT_LOOKUP_RATE_LIMIT_WINDOW_MS = 60_000;
export const MAX_PRODUCT_LOOKUP_RATE_LIMIT_BUCKETS = 10_000;
export const MAX_PRODUCT_NAME_LENGTH = 80;

type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

const globalForProductLookup = globalThis as unknown as {
  freshtrackProductLookupBuckets?: Map<string, number[]>;
};

const productLookupBuckets =
  globalForProductLookup.freshtrackProductLookupBuckets ?? new Map<string, number[]>();

globalForProductLookup.freshtrackProductLookupBuckets = productLookupBuckets;

function evictStaleProductLookupBuckets(windowStart: number) {
  for (const [key, timestamps] of productLookupBuckets) {
    const newest = timestamps[timestamps.length - 1];
    if (newest === undefined || newest <= windowStart) {
      productLookupBuckets.delete(key);
    }
  }

  if (productLookupBuckets.size >= MAX_PRODUCT_LOOKUP_RATE_LIMIT_BUCKETS) {
    const excess =
      productLookupBuckets.size - MAX_PRODUCT_LOOKUP_RATE_LIMIT_BUCKETS + 1;
    let removed = 0;
    for (const key of productLookupBuckets.keys()) {
      productLookupBuckets.delete(key);
      removed += 1;
      if (removed >= excess) break;
    }
  }
}

export function checkProductLookupRateLimit(
  userId: string,
  now = Date.now()
): RateLimitResult {
  const windowStart = now - PRODUCT_LOOKUP_RATE_LIMIT_WINDOW_MS;
  if (
    !productLookupBuckets.has(userId) &&
    productLookupBuckets.size >= MAX_PRODUCT_LOOKUP_RATE_LIMIT_BUCKETS
  ) {
    evictStaleProductLookupBuckets(windowStart);
  }
  const timestamps = (productLookupBuckets.get(userId) ?? []).filter(
    (timestamp) => timestamp > windowStart
  );

  if (timestamps.length >= PRODUCT_LOOKUP_RATE_LIMIT) {
    const oldest = timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((PRODUCT_LOOKUP_RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000)
    );
    productLookupBuckets.set(userId, timestamps);
    return { ok: false, retryAfterSeconds };
  }

  timestamps.push(now);
  productLookupBuckets.set(userId, timestamps);
  return { ok: true };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Pull a product name out of a UPCitemdb trial response. This source is not
 * food-specific, so we only ever take the title — it rescues a name when Open
 * Food Facts has no entry. Any unexpected shape or empty result yields null.
 */
export function parseUpcItemDbName(payload: unknown): string | null {
  if (!isRecord(payload) || !Array.isArray(payload.items)) return null;

  const first = payload.items[0];
  if (!isRecord(first)) return null;

  const title = typeof first.title === "string" ? first.title.trim() : "";
  return title.length > 0 ? title.slice(0, MAX_PRODUCT_NAME_LENGTH) : null;
}
