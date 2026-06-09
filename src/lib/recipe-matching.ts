// Shared ingredient-matching logic for recipe suggestions and Recipe Dive.
// Pure and network-free so it can be unit-tested and reused by both the
// suggestions route and the catalog query. It replaces the old naive
// two-way substring check (which matched "egg" to "eggplant" and "ice" to
// "rice") with normalized, token-based matching.

// Measurement words that are never part of an ingredient's identity.
const UNIT_WORDS = new Set([
  "cup", "cups", "tbsp", "tbsps", "tablespoon", "tablespoons", "tsp", "tsps",
  "teaspoon", "teaspoons", "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds",
  "g", "gram", "grams", "kg", "ml", "l", "liter", "liters", "litre", "litres",
  "clove", "cloves", "can", "cans", "pinch", "pinches", "dash", "slice", "slices",
  "package", "packages", "pkg", "pkgs", "jar", "jars", "stick", "sticks",
  "handful", "bunch", "bunches", "sprig", "sprigs", "piece", "pieces",
]);

// Descriptors that don't change which ingredient is meant.
const FILLER_WORDS = new Set([
  "fresh", "freshly", "chopped", "diced", "minced", "sliced", "shredded", "grated",
  "ground", "crushed", "large", "small", "medium", "ripe", "raw", "cooked",
  "boneless", "skinless", "organic", "whole", "finely", "roughly", "thinly",
  "baby", "extra", "virgin", "peeled", "seeded", "halved", "quartered", "drained",
  "rinsed", "softened", "melted", "beaten", "packed", "of", "and", "or", "a", "an",
  "the", "into", "for", "plus", "more", "as", "needed", "to", "taste", "optional",
]);

// Tokens too generic to anchor a match on their own. Two ingredients that share
// only a weak token (e.g. "garlic powder" and "chili powder") are not a match,
// but an exact normalized equality still is (so "salt" still matches "salt").
const WEAK_TOKENS = new Set([
  "powder", "oil", "sauce", "paste", "extract", "stock", "broth", "mix",
  "seasoning", "flake", "juice", "syrup", "vinegar", "flour", "sugar", "salt",
  "pepper", "water", "spray", "dressing", "spice",
]);

function singularize(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("ves")) return `${word.slice(0, -3)}f`;
  if (/(ses|xes|zes|ches|shes|oes)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

/**
 * Reduce a raw ingredient or item name to a comparable phrase: lowercased,
 * parentheticals and non-letters dropped, units/fillers removed, each remaining
 * word singularized. "2 cups fresh Spinach, chopped" -> "spinach".
 */
export function normalizeIngredientName(raw: string): string {
  return tokenizeIngredientName(raw).join(" ");
}

export function ingredientSearchTokens(rawNames: string[]): string[] {
  const tokens = new Set<string>();
  for (const rawName of rawNames) {
    for (const token of tokenizeIngredientName(rawName)) {
      tokens.add(token);
    }
  }

  return [...tokens];
}

function tokenizeIngredientName(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ") // drop parentheticals like "(boneless)"
    .replace(/[^a-z\s]/g, " ") // drop digits, fractions, punctuation
    .split(/\s+/)
    .filter((word) => word.length > 1 && !UNIT_WORDS.has(word) && !FILLER_WORDS.has(word))
    .map(singularize);
}

function ingredientsMatch(aTokens: string[], bTokens: string[]): boolean {
  if (aTokens.length === 0 || bTokens.length === 0) return false;

  // Exact normalized equality matches even on a weak token ("salt" == "salt").
  if (aTokens.join(" ") === bTokens.join(" ")) return true;

  // Otherwise require a shared token that isn't too generic to anchor on.
  const bSet = new Set(bTokens);
  return aTokens.some((token) => !WEAK_TOKENS.has(token) && bSet.has(token));
}

/**
 * Count how many of a recipe's ingredients are covered by the user's expiring
 * items. Returns the count plus the original recipe ingredient names that
 * matched (for the amber-dot highlighting in the UI).
 */
export function countExpiringMatches(
  recipeIngredientNames: string[],
  expiringItemNames: string[]
): { matchCount: number; matchingIngredients: string[] } {
  const expiringTokenSets = expiringItemNames
    .map(tokenizeIngredientName)
    .filter((tokens) => tokens.length > 0);

  const matchingIngredients: string[] = [];

  for (const name of recipeIngredientNames) {
    const tokens = tokenizeIngredientName(name);
    if (tokens.length === 0) continue;
    if (expiringTokenSets.some((expiring) => ingredientsMatch(tokens, expiring))) {
      matchingIngredients.push(name);
    }
  }

  return { matchCount: matchingIngredients.length, matchingIngredients };
}
