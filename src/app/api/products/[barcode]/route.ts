import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { normalizeOpenFoodFactsProduct, sanitizeBarcode } from "@/lib/barcode";
import { mapCategoryTagsToCategoryId } from "@/lib/barcode-category";
import { checkProductLookupRateLimit, parseUpcItemDbName } from "./_lib";
import { readLimitedJsonBody } from "@/lib/request-body";

/** Shape returned to the add-item form; `found: false` is always recoverable. */
export interface ProductLookupResult {
  found: boolean;
  name: string | null;
  brand: string | null;
  categoryId: number | null;
  quantity: number | null;
  unit: string | null;
  imageUrl: string | null;
}

const NOT_FOUND: ProductLookupResult = {
  found: false,
  name: null,
  brand: null,
  categoryId: null,
  quantity: null,
  unit: null,
  imageUrl: null,
};

// Open Food Facts asks every caller to identify itself with a descriptive
// User-Agent that includes a contact URL.
const OFF_USER_AGENT = "FreshTrack/1.0 (https://freshtrack.up.railway.app)";

// Only the fields the normalizer reads — keeps the OFF payload small.
const OFF_FIELDS = [
  "product_name",
  "product_name_en",
  "generic_name",
  "abbreviated_product_name",
  "brands",
  "categories_tags_en",
  "categories_tags",
  "quantity",
  "product_quantity",
  "product_quantity_unit",
  "image_front_url",
].join(",");
const MAX_UPSTREAM_BODY_BYTES = 256 * 1024;

async function readUpstreamJson(response: Response): Promise<unknown> {
  const result = await readLimitedJsonBody(response, MAX_UPSTREAM_BODY_BYTES);
  return result.ok ? result.body : null;
}

async function lookupOpenFoodFacts(barcode: string): Promise<ProductLookupResult> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${OFF_FIELDS}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": OFF_USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
      // Cache identical lookups for a day; product data changes rarely.
      next: { revalidate: 86400 },
    });
  } catch {
    return NOT_FOUND; // timeout or network error — let the user type it in
  }

  if (!response.ok) return NOT_FOUND;

  const payload = await readUpstreamJson(response);
  const normalized = normalizeOpenFoodFactsProduct(payload);
  if (!normalized.found) return NOT_FOUND;

  return {
    found: true,
    name: normalized.name,
    brand: normalized.brand,
    categoryId: mapCategoryTagsToCategoryId(normalized.categoryTags),
    quantity: normalized.quantity,
    unit: normalized.unit,
    imageUrl: normalized.imageUrl,
  };
}

// Best-effort secondary source for products Open Food Facts doesn't know. The
// keyless trial endpoint is not food-specific (~100 req/day shared), so we take
// the name only and fail silently — it just rescues a name the user would
// otherwise type by hand.
async function lookupUpcItemDb(barcode: string): Promise<ProductLookupResult> {
  const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 86400 },
    });
    if (!response.ok) return NOT_FOUND;

    const name = parseUpcItemDbName(await readUpstreamJson(response));
    if (!name) return NOT_FOUND;

    return { ...NOT_FOUND, found: true, name };
  } catch {
    return NOT_FOUND;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ barcode: string }> }
) {
  // Session-gated like every other data route.
  const userId = await getCurrentUserId();

  const rateLimit = checkProductLookupRateLimit(userId);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: `Too many lookups. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { barcode: rawBarcode } = await params;
  const barcode = sanitizeBarcode(rawBarcode);
  if (!barcode) {
    return NextResponse.json({ error: "Invalid barcode." }, { status: 400 });
  }

  // Open Food Facts is primary (food-specific: gives category/quantity/image).
  // Fall back to UPCitemdb for a name when OFF has no entry.
  let result = await lookupOpenFoodFacts(barcode);
  if (!result.found) {
    result = await lookupUpcItemDb(barcode);
  }

  // Found products are stable enough to let the browser reuse a re-scan; misses
  // stay uncached since a barcode may be added to OFF later.
  return NextResponse.json(result, {
    headers: result.found ? { "Cache-Control": "private, max-age=86400" } : undefined,
  });
}
