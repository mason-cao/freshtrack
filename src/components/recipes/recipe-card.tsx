"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

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

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  isUseItUp?: boolean;
}

export function RecipeCard({ recipe, onSelect, isUseItUp }: RecipeCardProps) {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md ${
        isUseItUp ? "border-amber-200 bg-amber-50/50" : ""
      }`}
      onClick={() => onSelect(recipe)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{recipe.name}</CardTitle>
          {isUseItUp && recipe.matchCount && (
            <Badge variant="warning" className="shrink-0 ml-2">
              Uses {recipe.matchCount} expiring
            </Badge>
          )}
        </div>
        {recipe.description && (
          <p className="text-sm text-gray-500">{recipe.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {totalTime} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {recipe.servings} servings
            </span>
          )}
        </div>
        {isUseItUp && recipe.matchingIngredients && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.matchingIngredients.map((ing) => (
              <Badge key={ing} variant="warning" className="text-xs">
                {ing}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
