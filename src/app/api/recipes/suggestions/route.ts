import { NextResponse } from "next/server";
import { db } from "@/db";
import { items, recipes, recipeIngredients } from "@/db/schema";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { addDaysToDateInput, toDateInputValue } from "@/lib/dates";
import { getCurrentUserId } from "@/lib/session";

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
    )
    .all();

  const expiringNames = expiringItems.map((item) =>
    item.name.toLowerCase()
  );

  const allRecipes = await db
    .select()
    .from(recipes)
    .where(eq(recipes.userId, userId))
    .all();
  const recipeIds = allRecipes.map((recipe) => recipe.id);
  const allIngredients =
    recipeIds.length > 0
      ? await db
          .select()
          .from(recipeIngredients)
          .where(inArray(recipeIngredients.recipeId, recipeIds))
          .all()
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

      const matchingIngredients = ingredients.filter((ing) =>
        expiringNames.some(
          (name) =>
            name.includes(ing.ingredientName.toLowerCase()) ||
            ing.ingredientName.toLowerCase().includes(name.toLowerCase())
        )
      );

      return {
        ...recipe,
        ingredients,
        matchingIngredients: matchingIngredients.map((i) => i.ingredientName),
        matchCount: matchingIngredients.length,
      };
    })
    .filter((r) => r.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);

  return NextResponse.json(suggestions);
}
