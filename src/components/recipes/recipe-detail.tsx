"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{recipe.name}</DialogTitle>
          {recipe.description && (
            <DialogDescription>{recipe.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex items-center gap-4 text-sm text-gray-500">
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

        <div>
          <h3 className="mb-2 font-semibold text-gray-900">Ingredients</h3>
          <ul className="space-y-1">
            {recipe.ingredients.map((ing) => {
              const isMatching = recipe.matchingIngredients?.some(
                (m) =>
                  m.toLowerCase() === ing.ingredientName.toLowerCase()
              );
              return (
                <li
                  key={ing.id}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isMatching ? "bg-amber-500" : "bg-gray-300"
                    }`}
                  />
                  <span>
                    {ing.quantity} {ing.unit} {ing.ingredientName}
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
            <h3 className="mb-2 font-semibold text-gray-900">Instructions</h3>
            <div className="space-y-2 text-sm text-gray-700">
              {recipe.instructions.split("\n").map((step, i) => (
                <p key={i}>{step}</p>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
