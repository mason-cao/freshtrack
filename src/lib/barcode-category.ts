// Maps Open Food Facts category labels onto one of FreshTrack's 10 categories
// (see src/db/categories.ts) so a scanned product can prefill the category and,
// through it, a sensible default expiration. Matching is deliberately fuzzy: a
// best-effort guess the user reviews before saving, never a hard requirement.

interface CategoryRule {
  /** Category id from categorySeedData. */
  id: number;
  /**
   * Preservation state (frozen/canned) dominates real shelf life far more than
   * the food type, so those rules score double to win ties like
   * "frozen vegetables" (Frozen, not Produce).
   */
  weight: number;
  keywords: string[];
}

// Order matters only as a tie-break: earlier rules win equal scores.
const CATEGORY_RULES: CategoryRule[] = [
  { id: 5, weight: 2, keywords: ["frozen", "ice cream", "sorbet"] }, // Frozen
  { id: 6, weight: 2, keywords: ["canned", "tinned", "in brine"] }, // Canned
  {
    id: 2,
    weight: 1,
    keywords: ["dairy", "dairies", "milk", "cheese", "yogurt", "yoghurt", "butter", "cream", "kefir"],
  }, // Dairy
  {
    id: 3,
    weight: 1,
    keywords: ["meat", "meats", "poultry", "beef", "pork", "chicken", "fish", "seafood", "sausage", "bacon", "ham"],
  }, // Meat
  {
    id: 1,
    weight: 1,
    keywords: ["fruit", "fruits", "vegetable", "vegetables", "fresh foods", "legume", "legumes", "salad", "herb", "herbs"],
  }, // Produce
  {
    id: 4,
    weight: 1,
    keywords: ["bread", "breads", "bakery", "bakeries", "pastry", "pastries", "viennoiserie", "bun", "buns", "bagel", "croissant", "muffin"],
  }, // Bakery
  {
    id: 7,
    weight: 1,
    keywords: ["beverage", "beverages", "drink", "drinks", "juice", "juices", "soda", "sodas", "water", "waters", "tea", "teas", "coffee", "coffees", "smoothie", "smoothies"],
  }, // Beverages
  {
    id: 10,
    weight: 1,
    keywords: ["pasta", "pastas", "rice", "cereal", "cereals", "noodle", "noodles", "flour", "flours", "grain", "grains", "oat", "oats", "couscous", "quinoa"],
  }, // Grains & Pasta
  {
    id: 9,
    weight: 1,
    keywords: ["sauce", "sauces", "condiment", "condiments", "ketchup", "mustard", "mayonnaise", "dressing", "spice", "spices", "seasoning", "vinegar", "oil", "oils", "syrup", "honey", "jam", "spread", "spreads"],
  }, // Condiments
  {
    id: 8,
    weight: 1,
    keywords: ["snack", "snacks", "chocolate", "chocolates", "candy", "candies", "confectionery", "biscuit", "biscuits", "cookie", "cookies", "crisp", "crisps", "chip", "chips", "cracker", "crackers", "popcorn", "nut", "nuts", "cocoa", "sweet", "sweets"],
  }, // Snacks
];

// Whole-word match with prefix tolerance so plurals ("yogurt" → "yogurts") and
// compounds ("ham" → "hamburger") match, while substrings of unrelated words
// ("tea" in "steak", "oil" in "boiled") do not. Multi-word keywords match as a
// substring of the tag since the spaces already bound them.
function tagMatchesKeyword(tag: string, keyword: string): boolean {
  if (keyword.includes(" ")) return tag.includes(keyword);
  return tag.split(" ").some((word) => word === keyword || word.startsWith(keyword));
}

/**
 * Pick the best-fitting FreshTrack category id for a product's normalized
 * category tags, or null when nothing matches confidently. Score = number of
 * tags a rule matches, times the rule weight; ties break toward earlier rules.
 */
export function mapCategoryTagsToCategoryId(tags: string[]): number | null {
  let bestId: number | null = null;
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    const matchingTags = tags.filter((tag) =>
      rule.keywords.some((keyword) => tagMatchesKeyword(tag, keyword))
    ).length;
    const score = matchingTags * rule.weight;
    if (score > bestScore) {
      bestScore = score;
      bestId = rule.id;
    }
  }

  return bestScore > 0 ? bestId : null;
}
