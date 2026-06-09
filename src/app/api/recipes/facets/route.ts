import { NextResponse } from "next/server";
import { db } from "@/db";
import { visibleRecipeWhere } from "@/db/recipe-visibility";
import { recipes } from "@/db/schema";
import { facetValues } from "@/lib/recipe-results";
import { getCurrentUserId } from "@/lib/session";
import { and, asc, isNotNull } from "drizzle-orm";

export async function GET() {
  const userId = await getCurrentUserId();

  const [cuisineRows, categoryRows] = await Promise.all([
    db
      .selectDistinct({ cuisine: recipes.cuisine })
      .from(recipes)
      .where(and(visibleRecipeWhere(userId), isNotNull(recipes.cuisine)))
      .orderBy(asc(recipes.cuisine)),
    db
      .selectDistinct({ category: recipes.category })
      .from(recipes)
      .where(and(visibleRecipeWhere(userId), isNotNull(recipes.category)))
      .orderBy(asc(recipes.category)),
  ]);

  return NextResponse.json({
    cuisines: facetValues(cuisineRows.map((row) => row.cuisine)),
    categories: facetValues(categoryRows.map((row) => row.category)),
  });
}
