import type { AnalyticsEventName } from "@/lib/analytics-events";

const VISITOR_ID_KEY = "freshtrack:analytics:visitor-id";
const ATTRIBUTION_KEY = "freshtrack:analytics:attribution";

let fallbackVisitorId: string | null = null;

export interface AnalyticsAttribution {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}

interface AnalyticsPayloadOptions {
  eventName: AnalyticsEventName;
  visitorId: string;
  path: string;
  referrer: string | null;
  attribution: AnalyticsAttribution;
}

function clean(value: string | null): string | null {
  const text = value?.trim() ?? "";
  return text || null;
}

function hasAttribution(attribution: AnalyticsAttribution): boolean {
  return Boolean(
    attribution.utmSource ||
      attribution.utmMedium ||
      attribution.utmCampaign ||
      attribution.utmContent ||
      attribution.utmTerm
  );
}

function readStoredAttribution(): AnalyticsAttribution {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsAttribution) : {};
  } catch {
    return {};
  }
}

function writeStoredAttribution(attribution: AnalyticsAttribution) {
  if (typeof window === "undefined" || !hasAttribution(attribution)) return;

  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // Analytics must never break product flows.
  }
}

export function extractUtmAttribution(params: URLSearchParams): AnalyticsAttribution {
  return {
    utmSource: clean(params.get("utm_source")),
    utmMedium: clean(params.get("utm_medium")),
    utmCampaign: clean(params.get("utm_campaign")),
    utmContent: clean(params.get("utm_content")),
    utmTerm: clean(params.get("utm_term")),
  };
}

export function mergeAttribution(
  current: AnalyticsAttribution,
  stored: AnalyticsAttribution
): Required<AnalyticsAttribution> {
  return {
    utmSource: current.utmSource ?? stored.utmSource ?? null,
    utmMedium: current.utmMedium ?? stored.utmMedium ?? null,
    utmCampaign: current.utmCampaign ?? stored.utmCampaign ?? null,
    utmContent: current.utmContent ?? stored.utmContent ?? null,
    utmTerm: current.utmTerm ?? stored.utmTerm ?? null,
  };
}

export function buildAnalyticsPayload({
  eventName,
  visitorId,
  path,
  referrer,
  attribution,
}: AnalyticsPayloadOptions) {
  return {
    eventName,
    visitorId,
    path,
    referrer,
    utmSource: attribution.utmSource ?? null,
    utmMedium: attribution.utmMedium ?? null,
    utmCampaign: attribution.utmCampaign ?? null,
    utmContent: attribution.utmContent ?? null,
    utmTerm: attribution.utmTerm ?? null,
  };
}

export function stripUrlDetails(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

function createVisitorId(): string {
  return typeof window !== "undefined" &&
    typeof window.crypto?.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getFallbackVisitorId(): string {
  fallbackVisitorId ??= createVisitorId();
  return fallbackVisitorId;
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return getFallbackVisitorId();

  try {
    const existing = window.localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;

    const visitorId = createVisitorId();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
    return visitorId;
  } catch {
    return getFallbackVisitorId();
  }
}

function currentAttribution(): Required<AnalyticsAttribution> {
  const current = extractUtmAttribution(new URLSearchParams(window.location.search));
  const merged = mergeAttribution(current, readStoredAttribution());
  if (hasAttribution(current)) {
    writeStoredAttribution(merged);
  }
  return merged;
}

export function trackAnalyticsEvent(eventName: AnalyticsEventName) {
  if (typeof window === "undefined" || typeof fetch !== "function") return;

  const payload = buildAnalyticsPayload({
    eventName,
    visitorId: getOrCreateVisitorId(),
    path: window.location.pathname,
    referrer: stripUrlDetails(document.referrer),
    attribution: currentAttribution(),
  });

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

export function trackPageView() {
  trackAnalyticsEvent("page_view");
}
