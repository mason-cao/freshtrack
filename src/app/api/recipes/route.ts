import { NextResponse } from "next/server";
import { db } from "@/db";
import { recipes, recipeIngredients } from "@/db/schema";

export async function GET() {
  const allRecipes = await db.select().from(recipes).all();
  const allIngredients = await db.select().from(recipeIngredients).all();
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
