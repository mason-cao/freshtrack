import { MAX_ITEM_NAME_LENGTH } from "@/lib/item-validation";

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
  return title.length > 0 ? title.slice(0, MAX_ITEM_NAME_LENGTH) : null;
}
