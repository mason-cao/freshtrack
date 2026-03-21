import { NextResponse } from "next/server";
import { db } from "@/db";
import { recipes, recipeIngredients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allRecipes = db.select().from(recipes).all();

  const result = allRecipes.map((recipe) => {
    const ingredients = db
      .select()
      .from(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, recipe.id))
      .all();

    return { ...recipe, ingredients };
  });

  return NextResponse.json(result);
}
