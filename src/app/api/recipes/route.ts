import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { visibleRecipeWhere } from "@/db/recipe-visibility";
import { items, recipes, recipeIngredients } from "@/db/schema";
import { and, eq, gte, ilike, inArray, lte, or, type SQL } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/session";
import { addDaysToDateInput, toDateInputValue } from "@/lib/dates";
import { countExpiringMatches } from "@/lib/recipe-matching";
import { parseRecipeQuery, rankRecipes } from "@/lib/recipe-query";

// Escape LIKE wildcards so user text is matched literally.
function likePattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  const query = parseRecipeQuery(request.nextUrl.searchParams);

  const conditions: (SQL | undefined)[] = [visibleRecipeWhere(userId)];
  if (query.search) {
    const search = or(
      ilike(recipes.name, likePattern(query.search)),
      ilike(recipes.description, likePattern(query.search))
    );
    if (search) conditions.push(search);
  }
  if (query.cuisine) conditions.push(eq(recipes.cuisine, query.cuisine));
  if (query.category) conditions.push(eq(recipes.category, query.category));

  const allRecipes = await db
    .select()
    .from(recipes)
    .where(and(...conditions));

  const recipeIds = allRecipes.map((recipe) => recipe.id);
  const allIngredients =
    recipeIds.length > 0
      ? await db
          .select()
          .from(recipeIngredients)
          .where(inArray(recipeIngredients.recipeId, recipeIds))
      : [];
  const ingredientsByRecipe = new Map<number, typeof allIngredients>();
  for (const ingredient of allIngredients) {
    const current = ingredientsByRecipe.get(ingredient.recipeId) ?? [];
    current.push(ingredient);
    ingredientsByRecipe.set(ingredient.recipeId, current);
  }

  // Annotate with how many of the user's soon-to-expire items each recipe uses,
  // so cards can show match badges and relevance sort can float them to the top.
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
  const expiringNames = expiringItems.map((item) => item.name);

  const annotated = allRecipes.map((recipe) => {
    const ingredients = ingredientsByRecipe.get(recipe.id) ?? [];
    const { matchCount, matchingIngredients } = countExpiringMatches(
      ingredients.map((ing) => ing.ingredientName),
      expiringNames
    );
    return { ...recipe, ingredients, matchCount, matchingIngredients };
  });

  return NextResponse.json(rankRecipes(annotated, query));
}
