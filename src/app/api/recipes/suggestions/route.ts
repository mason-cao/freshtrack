import { NextResponse } from "next/server";
import { db } from "@/db";
import { visibleRecipeWhere } from "@/db/recipe-visibility";
import { recipes } from "@/db/schema";
import { and, inArray } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/session";
import {
  RECIPE_SUGGESTION_CANDIDATE_LIMIT,
  RECIPE_SUGGESTION_LIMIT,
} from "@/lib/recipe-results";
import {
  annotateRecipeMatches,
  findIngredientCandidateRecipeIds,
  getExpiringItemNames,
  getIngredientsByRecipe,
} from "../_lib";

export async function GET() {
  const userId = await getCurrentUserId();
  const expiringNames = await getExpiringItemNames(userId);
  if (expiringNames.length === 0) {
    return NextResponse.json([]);
  }

  const recipeIds = await findIngredientCandidateRecipeIds(
    expiringNames,
    RECIPE_SUGGESTION_CANDIDATE_LIMIT
  );
  if (recipeIds.length === 0) {
    return NextResponse.json([]);
  }

  const candidateRecipes = await db
    .select()
    .from(recipes)
    .where(and(visibleRecipeWhere(userId), inArray(recipes.id, recipeIds)))
    .limit(RECIPE_SUGGESTION_CANDIDATE_LIMIT);

  const ingredientsByRecipe = await getIngredientsByRecipe(
    candidateRecipes.map((recipe) => recipe.id)
  );

  const suggestions = annotateRecipeMatches(
    candidateRecipes,
    ingredientsByRecipe,
    expiringNames
  )
    .filter((r) => r.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, RECIPE_SUGGESTION_LIMIT);

  return NextResponse.json(suggestions);
}
