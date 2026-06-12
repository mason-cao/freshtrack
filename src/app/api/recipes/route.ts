import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { visibleRecipeWhere } from "@/db/recipe-visibility";
import { recipes } from "@/db/schema";
import { and, asc, count, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
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

async function countMatchingRecipes(userId: string, query: RecipeQuery) {
  const rows = await db
    .select({ value: count() })
    .from(recipes)
    .where(recipeConditions(userId, query));

  return Number(rows[0]?.value ?? 0);
}

async function loadFallbackRecipes(
  userId: string,
  query: RecipeQuery,
  candidateLimit: number
) {
  return db
    .select()
    .from(recipes)
    .where(recipeConditions(userId, query))
    .orderBy(asc(recipes.name))
    .limit(candidateLimit);
}

async function loadMatchedCandidateRecipes(
  userId: string,
  query: RecipeQuery,
  expiringNames: string[],
  candidateLimit: number
) {
  const recipeIds = await findIngredientCandidateRecipeIds(
    expiringNames,
    candidateLimit
  );
  if (recipeIds.length === 0) return [];

  return db
    .select()
    .from(recipes)
    .where(recipeConditions(userId, query, recipeIds))
    .limit(candidateLimit);
}

async function loadCandidateRecipes(
  userId: string,
  query: RecipeQuery,
  expiringNames: string[],
  fallbackLimit: number,
  matchedCandidateLimit: number
) {
  if (query.sort !== "relevance" || expiringNames.length === 0) {
    return loadFallbackRecipes(userId, query, fallbackLimit);
  }

  const [matchedRecipes, fallbackRecipes] = await Promise.all([
    loadMatchedCandidateRecipes(
      userId,
      query,
      expiringNames,
      matchedCandidateLimit
    ),
    loadFallbackRecipes(userId, query, fallbackLimit),
  ]);

  return uniqueRecipeRows(matchedRecipes, fallbackRecipes);
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  const query = parseRecipeQuery(request.nextUrl.searchParams);
  const expiringNames = await getExpiringItemNames(userId);
  const resultWindowLimit = query.offset + RECIPE_RESULT_LIMIT;
  const matchedCandidateLimit = Math.max(
    RECIPE_CANDIDATE_LIMIT,
    resultWindowLimit
  );
  const [total, candidateRecipes] = await Promise.all([
    countMatchingRecipes(userId, query),
    loadCandidateRecipes(
      userId,
      query,
      expiringNames,
      resultWindowLimit,
      matchedCandidateLimit
    ),
  ]);

  const recipeIds = candidateRecipes.map((recipe) => recipe.id);
  const ingredientsByRecipe = await getIngredientsByRecipe(recipeIds);
  const annotated = annotateRecipeMatches(
    candidateRecipes,
    ingredientsByRecipe,
    expiringNames
  );

  return NextResponse.json({
    recipes: rankRecipes(annotated, query).slice(
      query.offset,
      query.offset + RECIPE_RESULT_LIMIT
    ),
    total,
    limit: RECIPE_RESULT_LIMIT,
    offset: query.offset,
  });
}
