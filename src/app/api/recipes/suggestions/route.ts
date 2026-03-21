import { NextResponse } from "next/server";
import { db } from "@/db";
import { items, recipes, recipeIngredients } from "@/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";

export async function GET() {
  const today = new Date();
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(today.getDate() + 5);

  const todayStr = today.toISOString().split("T")[0];
  const futureStr = fiveDaysFromNow.toISOString().split("T")[0];

  // Get items expiring within 5 days
  const expiringItems = db
    .select()
    .from(items)
    .where(
      and(
        eq(items.status, "active"),
        lte(items.expirationDate, futureStr),
        gte(items.expirationDate, todayStr)
      )
    )
    .all();

  const expiringNames = expiringItems.map((item) =>
    item.name.toLowerCase()
  );

  // Get all recipes with ingredients
  const allRecipes = db.select().from(recipes).all();

  const suggestions = allRecipes
    .map((recipe) => {
      const ingredients = db
        .select()
        .from(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, recipe.id))
        .all();

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
