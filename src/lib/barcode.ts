// Pure, network-free helpers for the barcode → product lookup flow.
// The route handler (src/app/api/products/[barcode]) does the fetching; this
// module only sanitizes input and normalizes an Open Food Facts response into
// the shape the add-item form consumes. Keeping it side-effect free makes the
// fallback chains and parsing fully unit-testable.

/** Product fields extracted from an Open Food Facts lookup. */
export interface NormalizedProduct {
  /** True only when we resolved at least a usable product name. */
  found: boolean;
  name: string | null;
  brand: string | null;
  /** Faithful parse of the pack quantity; the UI maps units to its own set. */
  quantity: number | null;
  unit: string | null;
  imageUrl: string | null;
  /** Normalized English category labels; commit 4 maps these to a category id. */
  categoryTags: string[];
}

const NOT_FOUND: NormalizedProduct = {
  found: false,
  name: null,
  brand: null,
  quantity: null,
  unit: null,
  imageUrl: null,
  categoryTags: [],
};

const MAX_PRODUCT_TEXT_LENGTH = 80;
const MAX_CATEGORY_TAGS = 50;
const MAX_PRODUCT_QUANTITY = 1_000_000;

/**
 * Accept only plausible retail barcodes: digits, 8–14 long. Covers EAN-8,
 * UPC-E (expanded), UPC-A (12), EAN-13 (13) and GTIN-14. Rejecting everything
 * else keeps untrusted path input from reaching the upstream fetch.
 */
export function sanitizeBarcode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return /^[0-9]{8,14}$/.test(trimmed) ? trimmed : null;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Name fallback chain, most-specific first. The English name reads best for our
// (English) audience; generic/abbreviated names rescue sparse OFF entries.
function readProductName(product: Record<string, unknown>): string | null {
  const name =
    readString(product.product_name_en) ??
    readString(product.product_name) ??
    readString(product.generic_name) ??
    readString(product.abbreviated_product_name);
  return name?.slice(0, MAX_PRODUCT_TEXT_LENGTH) ?? null;
}

// OFF stores brands as a comma-separated list; the first is the primary brand.
function readBrand(product: Record<string, unknown>): string | null {
  const brands = readString(product.brands);
  if (!brands) return null;
  return readString(brands.split(",")[0])?.slice(0, MAX_PRODUCT_TEXT_LENGTH) ?? null;
}

function readImageUrl(product: Record<string, unknown>): string | null {
  const candidate = readString(product.image_front_url);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? candidate : null;
  } catch {
    return null;
  }
}

function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/^[a-z]{2}:/, "") // drop language prefixes like "en:"
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readCategoryTags(product: Record<string, unknown>): string[] {
  const raw = Array.isArray(product.categories_tags_en)
    ? product.categories_tags_en
    : Array.isArray(product.categories_tags)
      ? product.categories_tags
      : [];

  const seen = new Set<string>();
  for (const entry of raw) {
    const value = readString(entry);
    if (!value) continue;
    const normalized = normalizeTag(value);
    if (normalized) seen.add(normalized);
  }
  return [...seen].slice(0, MAX_CATEGORY_TAGS);
}

function toPositiveNumber(value: unknown): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= MAX_PRODUCT_QUANTITY
  ) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    if (
      Number.isFinite(parsed) &&
      parsed > 0 &&
      parsed <= MAX_PRODUCT_QUANTITY
    ) {
      return parsed;
    }
  }
  return null;
}

/**
 * Parse the pack size. OFF best case gives a numeric `product_quantity` plus a
 * `product_quantity_unit`; otherwise we parse the freeform `quantity` string
 * ("500 g", "1,5 L"). We return the unit verbatim (lowercased) — the add-item
 * UI decides how to map it onto its own unit list.
 */
export function parseProductQuantity(
  product: Record<string, unknown>
): { quantity: number | null; unit: string | null } {
  const structured = toPositiveNumber(product.product_quantity);
  if (structured !== null) {
    return { quantity: structured, unit: readString(product.product_quantity_unit)?.toLowerCase() ?? null };
  }

  const freeform = readString(product.quantity);
  if (freeform) {
    const match = freeform.match(/(\d+(?:[.,]\d+)?)\s*([a-zµ%]+)?/i);
    if (match) {
      const quantity = toPositiveNumber(match[1]);
      if (quantity !== null) {
        return { quantity, unit: match[2] ? match[2].toLowerCase() : null };
      }
    }
  }

  return { quantity: null, unit: null };
}

/**
 * Turn a parsed Open Food Facts v2 response into a NormalizedProduct. Tolerant
 * of any shape: a miss, an incomplete entry, or an unexpected payload all fall
 * back to `found: false` so the caller can try a secondary source or let the
 * user type the item manually.
 */
export function normalizeOpenFoodFactsProduct(payload: unknown): NormalizedProduct {
  if (!isRecord(payload)) return NOT_FOUND;

  // OFF v2 returns status 1 when the barcode is known, 0 otherwise.
  if (payload.status === 0) return NOT_FOUND;
  if (!isRecord(payload.product)) return NOT_FOUND;

  const product = payload.product;
  const name = readProductName(product);
  if (!name) return NOT_FOUND; // a known barcode with no usable name is a miss

  const { quantity, unit } = parseProductQuantity(product);

  return {
    found: true,
    name,
    brand: readBrand(product),
    quantity,
    unit,
    imageUrl: readImageUrl(product),
    categoryTags: readCategoryTags(product),
  };
}
