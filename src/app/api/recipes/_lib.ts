import { db } from "@/db";
import { items, recipeIngredients } from "@/db/schema";
import { addDaysToDateInput, toDateInputValue } from "@/lib/dates";
import { countExpiringMatches, ingredientSearchTokens } from "@/lib/recipe-matching";
import { and, eq, gte, ilike, inArray, lte, or, type SQL } from "drizzle-orm";

const INGREDIENT_PREFILTER_TOKEN_LIMIT = 48;

type RecipeIngredientRow = typeof recipeIngredients.$inferSelect;

// Escape LIKE wildcards so user text is matched literally.
export function likePattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

function ingredientTokenCondition(expiringNames: string[]): SQL | undefined {
  const tokens = ingredientSearchTokens(expiringNames).slice(
    0,
    INGREDIENT_PREFILTER_TOKEN_LIMIT
  );
  if (tokens.length === 0) return undefined;

  return or(
    ...tokens.map((token) =>
      ilike(recipeIngredients.ingredientName, likePattern(token))
    )
  );
}

export async function getExpiringItemNames(userId: string): Promise<string[]> {
  const expiringItems = await db
    .select({ name: items.name })
    .from(items)
    .where(
      and(
        eq(items.userId, userId),
        eq(items.status, "active"),
        lte(items.expirationDate, addDaysToDateInput(5)),
        gte(items.expirationDate, toDateInputValue())
      )
    );

  return expiringItems.map((item) => item.name);
}

export async function findIngredientCandidateRecipeIds(
  expiringNames: string[],
  limit: number
): Promise<number[]> {
  const condition = ingredientTokenCondition(expiringNames);
  if (!condition) return [];

  const rows = await db
    .selectDistinct({ recipeId: recipeIngredients.recipeId })
    .from(recipeIngredients)
    .where(condition)
    .limit(limit);

  return rows.map((row) => row.recipeId);
}

export async function getIngredientsByRecipe(
  recipeIds: number[]
): Promise<Map<number, RecipeIngredientRow[]>> {
  const allIngredients =
    recipeIds.length > 0
      ? await db
          .select()
          .from(recipeIngredients)
          .where(inArray(recipeIngredients.recipeId, recipeIds))
      : [];

  const ingredientsByRecipe = new Map<number, RecipeIngredientRow[]>();
  for (const ingredient of allIngredients) {
    const current = ingredientsByRecipe.get(ingredient.recipeId) ?? [];
    current.push(ingredient);
    ingredientsByRecipe.set(ingredient.recipeId, current);
  }

  return ingredientsByRecipe;
}

export function annotateRecipeMatches<T extends { id: number }>(
  recipeRows: T[],
  ingredientsByRecipe: Map<number, RecipeIngredientRow[]>,
  expiringNames: string[]
) {
  return recipeRows.map((recipe) => {
    const ingredients = ingredientsByRecipe.get(recipe.id) ?? [];
    const { matchCount, matchingIngredients } = countExpiringMatches(
      ingredients.map((ing) => ing.ingredientName),
      expiringNames
    );

    return { ...recipe, ingredients, matchCount, matchingIngredients };
  });
}
