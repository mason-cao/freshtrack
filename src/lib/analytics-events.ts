export const analyticsEventNames = [
  "page_view",
  "active_ping",
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

function normalizedPath(value: unknown): { ok: true; value: string } | { ok: false; error: string } {
  const path = normalizedText(value) || "/";
  if (path.length > MAX_PATH_LENGTH) {
    return { ok: false, error: `Path must be ${MAX_PATH_LENGTH} characters or fewer.` };
  }

  try {
    const base = new URL("https://freshtrack.invalid");
    const url = new URL(path, base);
    if (url.origin !== base.origin || !path.startsWith("/")) {
      return { ok: false, error: "Path must be a same-site path." };
    }
    return { ok: true, value: url.pathname };
  } catch {
    return { ok: false, error: "Path must be a same-site path." };
  }
}

function normalizedReferrer(
  value: unknown
): { ok: true; value: string | null } | { ok: false; error: string } {
  const result = optionalText(value, "Referrer", MAX_REFERRER_LENGTH);
  if (!result.ok || result.value === null) return result;

  try {
    const url = new URL(result.value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, error: "Referrer must be a valid web URL." };
    }
    return { ok: true, value: `${url.origin}${url.pathname}` };
  } catch {
    return { ok: false, error: "Referrer must be a valid web URL." };
  }
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

  const path = normalizedPath(payload.path);
  if (!path.ok) return { ok: false, error: path.error };

  const referrer = normalizedReferrer(payload.referrer);
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
      path: path.value,
      referrer: referrer.value,
      utmSource: utmSource.value,
      utmMedium: utmMedium.value,
      utmCampaign: utmCampaign.value,
      utmContent: utmContent.value,
      utmTerm: utmTerm.value,
    },
  };
}
