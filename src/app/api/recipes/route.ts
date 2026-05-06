import { NextResponse } from "next/server";
import { db } from "@/db";
import { recipes, recipeIngredients } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  const allRecipes = await db
    .select()
    .from(recipes)
    .where(eq(recipes.userId, userId));
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

  const result = allRecipes.map((recipe) => ({
    ...recipe,
    ingredients: ingredientsByRecipe.get(recipe.id) ?? [],
  }));

  return NextResponse.json(result);
}
