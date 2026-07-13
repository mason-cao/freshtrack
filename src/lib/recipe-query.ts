// Pure query parsing and ranking for the Recipe Dive catalog. The route does
// the SQL text/cuisine/category filtering; the time filter and ordering live
// here so they can be unit tested without a database.

export interface RecipeQuery {
  search: string | null;
  cuisine: string | null;
  category: string | null;
  maxMinutes: number | null;
  sort: "relevance" | "name";
  offset: number;
}

const MAX_TEXT_LENGTH = 80;
export const MAX_RECIPE_QUERY_MINUTES = 24 * 60;
export const MAX_RECIPE_QUERY_OFFSET = 2_000;

function cleanText(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, MAX_TEXT_LENGTH) : null;
}

export function parseRecipeQuery(params: URLSearchParams): RecipeQuery {
  const maxRaw = params.get("maxMinutes");
  const offsetRaw = params.get("offset");
  const maxNumber = maxRaw && /^\d+$/.test(maxRaw) ? Number(maxRaw) : Number.NaN;
  const offsetNumber =
    offsetRaw && /^\d+$/.test(offsetRaw) ? Number(offsetRaw) : Number.NaN;

  return {
    search: cleanText(params.get("search")),
    cuisine: cleanText(params.get("cuisine")),
    category: cleanText(params.get("category")),
    maxMinutes:
      Number.isSafeInteger(maxNumber) && maxNumber > 0
        ? Math.min(maxNumber, MAX_RECIPE_QUERY_MINUTES)
        : null,
    sort: params.get("sort") === "name" ? "name" : "relevance",
    offset:
      Number.isSafeInteger(offsetNumber) && offsetNumber > 0
        ? Math.min(offsetNumber, MAX_RECIPE_QUERY_OFFSET)
        : 0,
  };
}

export interface RankableRecipe {
  name: string;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  matchCount: number;
}

/** Total known prep+cook time, or null when the recipe has no time data. */
export function totalTimeMinutes(recipe: Pick<RankableRecipe, "prepTimeMinutes" | "cookTimeMinutes">): number | null {
  if (recipe.prepTimeMinutes == null && recipe.cookTimeMinutes == null) return null;
  return (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
}

/**
 * Apply the max-time filter and order the catalog. Recipes with no time data
 * are kept under a maxMinutes filter (we can't prove they're slow, and most of
 * the imported catalog has no times). Relevance orders by expiring-item match
 * count first, then name; "name" orders alphabetically.
 */
export function rankRecipes<T extends RankableRecipe>(
  recipes: T[],
  query: Pick<RecipeQuery, "maxMinutes" | "sort">
): T[] {
  const filtered =
    query.maxMinutes == null
      ? recipes
      : recipes.filter((recipe) => {
          const total = totalTimeMinutes(recipe);
          return total === null || total <= query.maxMinutes!;
        });

  return [...filtered].sort((a, b) => {
    if (query.sort === "name") return a.name.localeCompare(b.name);
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return a.name.localeCompare(b.name);
  });
}
