// Pure parsing for the one-time TheMealDB catalog import. Kept free of network
// and database access so the quality gate and measure parsing can be unit
// tested. The runner (import-mealdb.ts) handles fetching and upserting.

export interface RawMeal {
  idMeal?: string;
  strMeal?: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strMealThumb?: string;
  strSource?: string;
  // strIngredient1..20 / strMeasure1..20
  [key: string]: string | undefined;
}

export interface ParsedIngredient {
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
}

export interface ParsedRecipe {
  externalId: string;
  name: string;
  description: string | null;
  instructions: string;
  imageUrl: string;
  cuisine: string | null;
  category: string | null;
  sourceUrl: string;
  ingredients: ParsedIngredient[];
}

function parseFraction(fraction: string): number {
  const [numerator, denominator] = fraction.split("/").map(Number);
  return denominator ? numerator / denominator : 0;
}

function parseQuantityToken(token: string): number | null {
  const trimmed = token.trim();
  if (trimmed.includes(" ")) {
    const [whole, fraction] = trimmed.split(/\s+/);
    return Number(whole) + parseFraction(fraction);
  }
  if (trimmed.includes("/")) return parseFraction(trimmed);
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/**
 * Split a TheMealDB measure ("1 1/2 cups", "200g", "Pinch") into a numeric
 * quantity and a unit. Unparseable amounts keep their text in `unit` so the
 * card can still show "Pinch" or "to taste"; matching only needs the name.
 */
export function parseMeasure(raw: string | undefined): { quantity: number | null; unit: string | null } {
  const text = (raw ?? "").trim();
  if (!text) return { quantity: null, unit: null };

  const match = text.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(.*)$/);
  if (!match) return { quantity: null, unit: text };

  const unit = match[2].trim();
  return { quantity: parseQuantityToken(match[1]), unit: unit.length > 0 ? unit : null };
}

export function collectIngredients(meal: RawMeal): ParsedIngredient[] {
  const ingredients: ParsedIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (meal[`strIngredient${i}`] ?? "").trim();
    if (!name) continue;
    const { quantity, unit } = parseMeasure(meal[`strMeasure${i}`]);
    ingredients.push({ ingredientName: name, quantity, unit });
  }
  return ingredients;
}

function cleanField(value: string | undefined): string | null {
  const text = (value ?? "").trim();
  if (!text || text.toLowerCase() === "unknown") return null;
  return text;
}

function makeDescription(instructions: string): string {
  const text = instructions.replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  const cut = text.slice(0, 160);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Convert a raw meal into a global recipe, or null if it fails the quality
 * gate: it must have a name, instructions, a thumbnail, and at least two
 * ingredients. externalId namespaces the source so re-imports are idempotent.
 */
export function parseMeal(meal: RawMeal): ParsedRecipe | null {
  const idMeal = (meal.idMeal ?? "").trim();
  const name = (meal.strMeal ?? "").trim();
  const instructions = (meal.strInstructions ?? "").trim();
  const imageUrl = (meal.strMealThumb ?? "").trim();
  const ingredients = collectIngredients(meal);

  if (!idMeal || !name || !instructions || !imageUrl || ingredients.length < 2) {
    return null;
  }

  return {
    externalId: `mealdb:${idMeal}`,
    name,
    description: makeDescription(instructions),
    instructions,
    imageUrl,
    cuisine: cleanField(meal.strArea),
    category: cleanField(meal.strCategory),
    sourceUrl: cleanField(meal.strSource) ?? `https://www.themealdb.com/meal/${idMeal}`,
    ingredients,
  };
}
