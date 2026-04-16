"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
}

interface RecipeDetailProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
}

export function RecipeDetail({ recipe, open, onClose }: RecipeDetailProps) {
  if (!recipe) return null;

  const totalTime =
    (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg xl:max-w-2xl 2xl:max-w-3xl max-h-[80vh] overflow-y-auto p-0">
        {/* Hero image */}
        <div className="relative h-48 xl:h-56 w-full overflow-hidden bg-warm-50">
          <Image
            src={getRecipeImage(recipe.name)}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 476px, 672px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="px-6 pt-4 pb-6 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-xl">{recipe.name}</DialogTitle>
          {recipe.description && (
            <DialogDescription>{recipe.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex items-center gap-4 text-sm text-stone-500">
          {recipe.prepTimeMinutes && recipe.prepTimeMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Prep: {recipe.prepTimeMinutes}m
            </span>
          )}
          {recipe.cookTimeMinutes && recipe.cookTimeMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Cook: {recipe.cookTimeMinutes}m
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recipe.servings} servings
            </span>
          )}
        </div>

        <div className="xl:grid xl:grid-cols-2 xl:gap-8">
          <div>
            <h3 className="mb-2 font-semibold text-stone-900">Ingredients</h3>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing) => {
                const isMatching = recipe.matchingIngredients?.some(
                  (m) =>
                    m.toLowerCase() === ing.ingredientName.toLowerCase()
                );
                return (
                  <li
                    key={ing.id}
                    className="flex items-center gap-2 text-sm text-stone-700"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isMatching ? "bg-amber-500" : "bg-warm-200"
                      }`}
                    />
                    <span>
                      {[ing.quantity, ing.unit, ing.ingredientName]
                        .filter((part) => part !== null && part !== "")
                        .join(" ")}
                    </span>
                    {isMatching && (
                      <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                        expiring soon
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {recipe.instructions && (
            <div>
              <h3 className="mb-2 font-semibold text-stone-900">Instructions</h3>
              <div className="space-y-2 text-sm text-stone-700">
                {recipe.instructions.split("\n").map((step, i) => (
                  <p key={i}>{step}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
