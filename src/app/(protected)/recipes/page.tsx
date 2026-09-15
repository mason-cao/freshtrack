"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { RecipeDiveBar } from "@/components/recipes/recipe-dive-bar";
import { BookOpen, Compass, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useRecipeCatalog } from "@/hooks/use-recipe-catalog";
import { ErrorState, LoadingState } from "@/components/ui/async-state";

import type { Recipe } from "@/lib/recipes";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

export default function RecipesPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const {
    suggestions, diveRecipes, cuisineOptions, categoryOptions, query, updateQuery, clearFilters,
    loading, loadingMore, searching, error, diveTotal, hasActiveFilters, canShowMore, refresh, showMore,
  } = useRecipeCatalog();

  if (loading) {
    return <LoadingState label="Loading recipes" />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h1 className="text-2xl xl:text-3xl font-bold text-stone-900">Recipes</h1>
        <p className="text-sm xl:text-base text-stone-500 mt-0.5">
          Find recipes to use up expiring ingredients
        </p>
      </motion.div>

      {suggestions.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-amber-50 p-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="text-base font-semibold text-stone-900">Use It Up</h2>
            <span className="text-sm text-stone-400">
              Recipes using your expiring items
            </span>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 xl:gap-5"
          >
            {suggestions.map((recipe) => (
              <motion.div key={recipe.id} variants={item}>
                <RecipeCard recipe={recipe} onSelect={setSelectedRecipe} isUseItUp />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-sage-50 p-1.5">
            <Compass className="h-4 w-4 text-sage-600" />
          </div>
          <h2 className="text-base font-semibold text-stone-900">Explore Recipes</h2>
          <span className="text-sm text-stone-400">Search and filter the full catalog</span>
        </div>

        <div className="mb-4">
          <RecipeDiveBar
            search={query.search}
            onSearchChange={(value) => updateQuery({ search: value })}
            cuisine={query.cuisine}
            onCuisineChange={(value) => updateQuery({ cuisine: value })}
            cuisineOptions={cuisineOptions}
            category={query.category}
            onCategoryChange={(value) => updateQuery({ category: value })}
            categoryOptions={categoryOptions}
            maxMinutes={query.maxMinutes}
            onMaxMinutesChange={(value) => updateQuery({ maxMinutes: value })}
            sort={query.sort}
            onSortChange={(value) => updateQuery({ sort: value })}
            resultCount={diveRecipes.length}
            resultTotal={diveTotal}
          />
        </div>

        {diveRecipes.length > 0 ? (
          <div className="space-y-5" aria-busy={searching}>
            <motion.div
              key={`${query.search}|${query.cuisine}|${query.category}|${query.maxMinutes}|${query.sort}`}
              variants={container}
              initial="hidden"
              animate="show"
              className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 xl:gap-5 transition-opacity duration-200 ${
                searching ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {diveRecipes.map((recipe) => (
                <motion.div key={recipe.id} variants={item}>
                  <RecipeCard recipe={recipe} onSelect={setSelectedRecipe} />
                </motion.div>
              ))}
            </motion.div>

            {canShowMore && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={showMore}
                  disabled={loadingMore || searching}
                  className="rounded-full border border-sage-200 bg-warm-white px-4 py-2 text-sm font-medium text-sage-700 shadow-warm-sm transition-colors duration-200 hover:bg-sage-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? "Loading..." : "Show more"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-warm-200 bg-warm-white/70">
            <EmptyState
              icon={BookOpen}
              title={hasActiveFilters ? "No recipes match your filters" : "No recipes yet"}
              description={
                hasActiveFilters
                  ? "Try a different search or clear a filter to see more."
                  : "Recipes have not been added for this environment yet."
              }
              actionLabel={hasActiveFilters ? "Clear filters" : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          </div>
        )}
      </section>

      <RecipeDetail
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}
