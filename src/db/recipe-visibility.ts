import { eq, isNull, or } from "drizzle-orm";
import { recipes } from "./schema";

export function isVisibleRecipeOwner(
  recipeUserId: string | null,
  currentUserId: string
) {
  return recipeUserId === null || recipeUserId === currentUserId;
}

export function visibleRecipeWhere(currentUserId: string) {
  return or(isNull(recipes.userId), eq(recipes.userId, currentUserId));
}
