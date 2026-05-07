"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { getRecipeImage } from "@/lib/food-images";

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
  const imageUrl = getRecipeImage(recipe.name);

  return (
    <button
      type="button"
      className={`group w-full cursor-pointer rounded-xl bg-warm-white text-left shadow-warm overflow-hidden transition-all duration-200 hover:shadow-warm-lg hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
        isUseItUp ? "ring-1 ring-amber-200" : ""
      }`}
      onClick={() => onSelect(recipe)}
    >
      {/* Image header */}
      <div className="relative h-36 xl:h-40 overflow-hidden bg-warm-50">
        <Image
          src={imageUrl}
          alt={recipe.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {isUseItUp && recipe.matchCount && (
          <div className="absolute top-2.5 right-2.5">
            <Badge variant="warning" className="text-[10px] shadow-sm">
              Uses {recipe.matchCount} expiring
            </Badge>
          </div>
        )}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2">
          {totalTime > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warm-white/95 px-2 py-0.5 text-[10px] font-medium text-stone-700 shadow-sm">
              <Clock className="h-2.5 w-2.5" />
              {totalTime}m
            </span>
          )}
          {recipe.servings && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warm-white/95 px-2 py-0.5 text-[10px] font-medium text-stone-700 shadow-sm">
              <Users className="h-2.5 w-2.5" />
              {recipe.servings}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-stone-900 text-sm xl:text-base line-clamp-1">
          {recipe.name}
        </h3>
        {recipe.description && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{recipe.description}</p>
        )}
        {isUseItUp && recipe.matchingIngredients && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {recipe.matchingIngredients.slice(0, 3).map((ing) => (
              <span key={ing} className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {ing}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
