"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { Sparkles } from "lucide-react";

interface RecipeIngredient {
  id: number;
  ingredientName: string;
  quantity: number | null;
  unit: string | null;
}

interface Recipe {
  id: number;
  name: string;
  description: string | null;
  instructions: string | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  ingredients: RecipeIngredient[];
  matchingIngredients?: string[];
  matchCount?: number;
}

export default function RecipesPage() {
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/recipes/suggestions").then((r) => r.json()),
      fetch("/api/recipes").then((r) => r.json()),
    ]).then(([suggestionsData, recipesData]) => {
      setSuggestions(suggestionsData);
      setAllRecipes(recipesData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Recipes"
        description="Find recipes to use up expiring ingredients"
      />

      {suggestions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Use It Up
            </h2>
            <span className="text-sm text-gray-500">
              — Recipes using your expiring ingredients
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={setSelectedRecipe}
                isUseItUp
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          All Recipes
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={setSelectedRecipe}
            />
          ))}
        </div>
      </div>

      <RecipeDetail
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}
