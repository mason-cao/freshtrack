import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { visibleRecipeWhere } from "@/db/recipe-visibility";
import { recipes } from "@/db/schema";
import { and, asc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/session";
import { parseRecipeQuery, rankRecipes } from "@/lib/recipe-query";
import {
  RECIPE_CANDIDATE_LIMIT,
  RECIPE_RESULT_LIMIT,
  uniqueRecipeRows,
} from "@/lib/recipe-results";
import {
  annotateRecipeMatches,
  findIngredientCandidateRecipeIds,
  getExpiringItemNames,
  getIngredientsByRecipe,
  likePattern,
} from "./_lib";
import type { RecipeQuery } from "@/lib/recipe-query";

function maxMinutesCondition(maxMinutes: number | null): SQL | undefined {
  if (maxMinutes == null) return undefined;
  return sql`(coalesce(${recipes.prepTimeMinutes}, 0) + coalesce(${recipes.cookTimeMinutes}, 0)) <= ${maxMinutes}`;
}

function recipeConditions(userId: string, query: RecipeQuery, recipeIds?: number[]) {
  const conditions: (SQL | undefined)[] = [
    visibleRecipeWhere(userId),
    maxMinutesCondition(query.maxMinutes),
  ];

  if (query.search) {
    conditions.push(
      or(
        ilike(recipes.name, likePattern(query.search)),
        ilike(recipes.description, likePattern(query.search))
      )
    );
  }
  if (query.cuisine) conditions.push(eq(recipes.cuisine, query.cuisine));
  if (query.category) conditions.push(eq(recipes.category, query.category));
  if (recipeIds && recipeIds.length > 0) conditions.push(inArray(recipes.id, recipeIds));

  return and(...conditions);
}

async function loadFallbackRecipes(userId: string, query: RecipeQuery) {
  return db
    .select()
    .from(recipes)
    .where(recipeConditions(userId, query))
    .orderBy(asc(recipes.name))
    .limit(RECIPE_RESULT_LIMIT);
}

async function loadMatchedCandidateRecipes(
  userId: string,
  query: RecipeQuery,
  expiringNames: string[]
) {
  const recipeIds = await findIngredientCandidateRecipeIds(
    expiringNames,
    RECIPE_CANDIDATE_LIMIT
  );
  if (recipeIds.length === 0) return [];

  return db
    .select()
    .from(recipes)
    .where(recipeConditions(userId, query, recipeIds))
    .limit(RECIPE_CANDIDATE_LIMIT);
}

async function loadCandidateRecipes(
  userId: string,
  query: RecipeQuery,
  expiringNames: string[]
) {
  if (query.sort !== "relevance" || expiringNames.length === 0) {
    return loadFallbackRecipes(userId, query);
  }

  const [matchedRecipes, fallbackRecipes] = await Promise.all([
    loadMatchedCandidateRecipes(userId, query, expiringNames),
    loadFallbackRecipes(userId, query),
  ]);

  return uniqueRecipeRows(matchedRecipes, fallbackRecipes);
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  const query = parseRecipeQuery(request.nextUrl.searchParams);
  const expiringNames = await getExpiringItemNames(userId);
  const candidateRecipes = await loadCandidateRecipes(userId, query, expiringNames);

  const recipeIds = candidateRecipes.map((recipe) => recipe.id);
  const ingredientsByRecipe = await getIngredientsByRecipe(recipeIds);
  const annotated = annotateRecipeMatches(
    candidateRecipes,
    ingredientsByRecipe,
    expiringNames
  );

  return NextResponse.json(rankRecipes(annotated, query).slice(0, RECIPE_RESULT_LIMIT));
}
