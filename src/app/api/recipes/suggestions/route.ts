import type { Recipe } from "@/lib/recipes";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { RECIPE_SUGGESTION_LIMIT } from "@/lib/recipe-results";
import { getExpiringItemNames, suggestRecipes } from "../_lib";

export async function GET() {
  const userId = await getCurrentUserId();
  const expiringNames = await getExpiringItemNames(userId);
  const suggestions = await suggestRecipes(userId, expiringNames, RECIPE_SUGGESTION_LIMIT);

  return NextResponse.json(suggestions satisfies Recipe[]);
}
