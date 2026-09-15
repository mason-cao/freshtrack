import type { RecipeQuery } from "./recipe-query";

export interface RecipeIngredient {
  id: number;
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
}

export interface Recipe {
  id: number;
  name: string;
  description: string | null;
  instructions: string | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  imageUrl?: string | null;
  cuisine?: string | null;
  category?: string | null;
  sourceUrl?: string | null;
  ingredients: RecipeIngredient[];
  matchingIngredients?: string[];
  matchCount?: number;
}

export type RecipeFilters = Omit<RecipeQuery, "offset" | "search"> & { search: string };

export interface RecipeFacets {
  cuisines: string[];
  categories: string[];
}

export interface RecipeResultsResponse {
  recipes: Recipe[];
  total: number;
  limit: number;
  offset: number;
}
