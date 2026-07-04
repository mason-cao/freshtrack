export const analyticsEventNames = [
  "page_view",
  "sign_in_clicked",
  "signed_in",
  "item_added",
  "first_5_items_added",
  "item_consumed",
  "item_wasted",
  "item_restored",
  "item_edited",
  "item_deleted",
  "barcode_scanned",
  "barcode_lookup_hit",
  "barcode_lookup_miss",
  "pwa_install_prompt_shown",
  "pwa_install_prompt_dismissed",
  "pwa_install_accepted",
] as const;

export const ANALYTICS_EVENT_RATE_LIMIT = 120;
export const ANALYTICS_EVENT_RATE_LIMIT_WINDOW_MS = 60_000;
// Rate-limit keys include caller-supplied visitor ids, so the bucket map must
// be bounded or an attacker can grow it without limit.
export const MAX_ANALYTICS_RATE_LIMIT_BUCKETS = 10_000;

const MAX_VISITOR_ID_LENGTH = 128;
const MAX_PATH_LENGTH = 500;
const MAX_REFERRER_LENGTH = 500;
const MAX_UTM_LENGTH = 160;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export interface AnalyticsEventInput {
  eventName: AnalyticsEventName;
  visitorId: string;
  path: string;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

type ValidationResult =
  | { ok: true; data: AnalyticsEventInput }
  | { ok: false; error: string };

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

const globalForAnalytics = globalThis as unknown as {
  freshtrackAnalyticsEventBuckets?: Map<string, number[]>;
};

const analyticsEventBuckets =
  globalForAnalytics.freshtrackAnalyticsEventBuckets ?? new Map<string, number[]>();

globalForAnalytics.freshtrackAnalyticsEventBuckets = analyticsEventBuckets;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizedText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(
  value: unknown,
  label: string,
  maxLength: number
): { ok: true; value: string | null } | { ok: false; error: string } {
  const text = normalizedText(value);
  if (!text) return { ok: true, value: null };
  if (text.length > maxLength) {
    return { ok: false, error: `${label} must be ${maxLength} characters or fewer.` };
  }
  return { ok: true, value: text };
}

function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return analyticsEventNames.includes(value as AnalyticsEventName);
}

export function validateAnalyticsEventPayload(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, error: "Expected a JSON object." };
  }

  const eventName = normalizedText(payload.eventName);
  if (!isAnalyticsEventName(eventName)) {
    return { ok: false, error: "Unsupported analytics event." };
  }

  const visitorId = normalizedText(payload.visitorId);
  if (!visitorId) {
    return { ok: false, error: "Visitor id is required." };
  }
  if (visitorId.length > MAX_VISITOR_ID_LENGTH) {
    return {
      ok: false,
      error: `Visitor id must be ${MAX_VISITOR_ID_LENGTH} characters or fewer.`,
    };
  }

  const path = normalizedText(payload.path) || "/";
  if (!path.startsWith("/")) {
    return { ok: false, error: "Path must be a same-site path." };
  }
  if (path.length > MAX_PATH_LENGTH) {
    return { ok: false, error: `Path must be ${MAX_PATH_LENGTH} characters or fewer.` };
  }

  const referrer = optionalText(payload.referrer, "Referrer", MAX_REFERRER_LENGTH);
  if (!referrer.ok) return { ok: false, error: referrer.error };

  const utmSource = optionalText(payload.utmSource, "UTM source", MAX_UTM_LENGTH);
  if (!utmSource.ok) return { ok: false, error: utmSource.error };

  const utmMedium = optionalText(payload.utmMedium, "UTM medium", MAX_UTM_LENGTH);
  if (!utmMedium.ok) return { ok: false, error: utmMedium.error };

  const utmCampaign = optionalText(payload.utmCampaign, "UTM campaign", MAX_UTM_LENGTH);
  if (!utmCampaign.ok) return { ok: false, error: utmCampaign.error };

  const utmContent = optionalText(payload.utmContent, "UTM content", MAX_UTM_LENGTH);
  if (!utmContent.ok) return { ok: false, error: utmContent.error };

  const utmTerm = optionalText(payload.utmTerm, "UTM term", MAX_UTM_LENGTH);
  if (!utmTerm.ok) return { ok: false, error: utmTerm.error };

  return {
    ok: true,
    data: {
      eventName,
      visitorId,
      path,
      referrer: referrer.value,
      utmSource: utmSource.value,
      utmMedium: utmMedium.value,
      utmCampaign: utmCampaign.value,
      utmContent: utmContent.value,
      utmTerm: utmTerm.value,
    },
  };
}

function evictStaleAnalyticsBuckets(windowStart: number) {
  for (const [key, timestamps] of analyticsEventBuckets) {
    const newest = timestamps[timestamps.length - 1];
    if (newest === undefined || newest <= windowStart) {
      analyticsEventBuckets.delete(key);
    }
  }

  // Still over the cap after dropping expired buckets: evict the oldest
  // insertions so memory stays bounded even under a flood of fresh keys.
  if (analyticsEventBuckets.size >= MAX_ANALYTICS_RATE_LIMIT_BUCKETS) {
    const excess =
      analyticsEventBuckets.size - MAX_ANALYTICS_RATE_LIMIT_BUCKETS + 1;
    let removed = 0;
    for (const key of analyticsEventBuckets.keys()) {
      analyticsEventBuckets.delete(key);
      removed += 1;
      if (removed >= excess) break;
    }
  }
}

export function checkAnalyticsEventRateLimit(
  key: string,
  now = Date.now()
): RateLimitResult {
  const windowStart = now - ANALYTICS_EVENT_RATE_LIMIT_WINDOW_MS;

  if (
    !analyticsEventBuckets.has(key) &&
    analyticsEventBuckets.size >= MAX_ANALYTICS_RATE_LIMIT_BUCKETS
  ) {
    evictStaleAnalyticsBuckets(windowStart);
  }

  const timestamps = (analyticsEventBuckets.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart
  );

  if (timestamps.length >= ANALYTICS_EVENT_RATE_LIMIT) {
    const oldest = timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((ANALYTICS_EVENT_RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000)
    );
    analyticsEventBuckets.set(key, timestamps);
    return { ok: false, retryAfterSeconds };
  }

  timestamps.push(now);
  analyticsEventBuckets.set(key, timestamps);
  return { ok: true };
}
