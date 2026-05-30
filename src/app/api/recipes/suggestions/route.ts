import { NextResponse } from "next/server";
import { db } from "@/db";
import { visibleRecipeWhere } from "@/db/recipe-visibility";
import { items, recipes, recipeIngredients } from "@/db/schema";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { addDaysToDateInput, toDateInputValue } from "@/lib/dates";
import { getCurrentUserId } from "@/lib/session";
import { countExpiringMatches } from "@/lib/recipe-matching";

export async function GET() {
  const userId = await getCurrentUserId();
  const todayStr = toDateInputValue();
  const futureStr = addDaysToDateInput(5);

  // Get items expiring within 5 days
  const expiringItems = await db
    .select()
    .from(items)
    .where(
      and(
        eq(items.userId, userId),
        eq(items.status, "active"),
        lte(items.expirationDate, futureStr),
        gte(items.expirationDate, todayStr)
      )
    );

  const expiringNames = expiringItems.map((item) => item.name);

  const allRecipes = await db
    .select()
    .from(recipes)
    .where(visibleRecipeWhere(userId));
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

  const suggestions = allRecipes
    .map((recipe) => {
      const ingredients = ingredientsByRecipe.get(recipe.id) ?? [];
      const { matchCount, matchingIngredients } = countExpiringMatches(
        ingredients.map((ing) => ing.ingredientName),
        expiringNames
      );

      return {
        ...recipe,
        ingredients,
        matchingIngredients,
        matchCount,
      };
    })
    .filter((r) => r.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);

  return NextResponse.json(suggestions);
}
