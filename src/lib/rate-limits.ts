import { createRateLimiter } from "./rate-limit";

export const ITEM_MUTATION_RATE_LIMIT = 60;
export const PRODUCT_LOOKUP_RATE_LIMIT = 30;
export const ANALYTICS_EVENT_RATE_LIMIT = 120;
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const MAX_RATE_LIMIT_BUCKETS = 10_000;

const persistent = globalThis as typeof globalThis & {
  freshtrackRateLimits?: Map<string, Map<string, number[]>>;
};
const stores = persistent.freshtrackRateLimits ??= new Map();

function policy(name: string, limit: number) {
  const buckets = stores.get(name) ?? new Map<string, number[]>();
  stores.set(name, buckets);
  return createRateLimiter({
    limit,
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxBuckets: MAX_RATE_LIMIT_BUCKETS,
  }, buckets);
}

export const checkItemMutationRateLimit = policy("items", ITEM_MUTATION_RATE_LIMIT);
export const checkProductLookupRateLimit = policy("products", PRODUCT_LOOKUP_RATE_LIMIT);
export const checkAnalyticsEventRateLimit = policy("analytics", ANALYTICS_EVENT_RATE_LIMIT);
