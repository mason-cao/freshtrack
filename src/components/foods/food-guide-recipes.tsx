import type { FoodPageData } from "@/lib/foods";
import Image from "next/image";
import { Clock, ChefHat } from "lucide-react";
import { starterRecipeSeedData } from "@/db/starter-recipes";
import { getRecipeHeroImage } from "@/lib/food-images";
import { countExpiringMatches } from "@/lib/recipe-matching";
import { Reveal } from "@/components/landing/reveal";

export function FoodGuideRecipes({ food }: { food: FoodPageData }) {
  const lowerName = food.displayName.toLowerCase();
  const matchedRecipes = starterRecipeSeedData.filter((recipe) =>
    countExpiringMatches(
      recipe.ingredients.map((ingredient) => ingredient.ingredientName),
      food.recipeMatchIngredients
    ).matchCount > 0
  );
  return (
    <>
      {matchedRecipes.length > 0 && (
        <section id="recipes" className="relative bg-cream">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <Reveal>
              <div className="max-w-2xl">
                <p className="eyebrow text-sage-700">Use it up</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                  Recipes that use {lowerName}.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
                  Real recipes from FreshTrack&apos;s starter set, all built
                  around what is already in your kitchen.
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matchedRecipes.slice(0, 6).map((recipe, i) => (
                <Reveal key={recipe.id} delay={0.06 * i}>
                  <article className="group relative h-full overflow-hidden rounded-3xl bg-warm-white shadow-warm-sm ring-1 ring-warm-100 transition-shadow duration-300 hover:shadow-warm-lg">
                    <div className="relative h-44 w-full overflow-hidden bg-warm-50">
                      <Image
                        src={getRecipeHeroImage(recipe.name)}
                        alt={recipe.name}
                        fill
                        sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold tracking-tight text-stone-900">
                        {recipe.name}
                      </h3>
                      {recipe.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                          {recipe.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-4 text-xs text-stone-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {(recipe.prepTimeMinutes ?? 0) +
                            (recipe.cookTimeMinutes ?? 0)}{" "}
                          minutes
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ChefHat className="h-3.5 w-3.5" />
                          Serves {recipe.servings ?? "?"}
                        </span>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
