"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { RecipeDiveBar } from "@/components/recipes/recipe-dive-bar";
import { BookOpen, Compass, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchJson } from "@/lib/api-client";
import { subscribeToPantryUpdates } from "@/lib/pantry-events";

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
  imageUrl?: string | null;
  cuisine?: string | null;
  category?: string | null;
  sourceUrl?: string | null;
  ingredients: RecipeIngredient[];
  matchingIngredients?: string[];
  matchCount?: number;
}

interface DiveQuery {
  search: string;
  cuisine: string | null;
  category: string | null;
  maxMinutes: number | null;
  sort: "relevance" | "name";
}

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

function distinctValues(recipes: Recipe[], key: "cuisine" | "category"): string[] {
  const values = new Set<string>();
  for (const recipe of recipes) {
    const value = recipe[key];
    if (value) values.add(value);
  }
  return [...values].sort((a, b) => a.localeCompare(b));
}

export default function RecipesPage() {
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [diveRecipes, setDiveRecipes] = useState<Recipe[]>([]);
  const [cuisineOptions, setCuisineOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const facetsLoaded = useRef(false);

  const [query, setQuery] = useState<DiveQuery>({
    search: "",
    cuisine: null,
    category: null,
    maxMinutes: null,
    sort: "relevance",
  });

  const updateQuery = useCallback((patch: Partial<DiveQuery>) => {
    setQuery((current) => ({ ...current, ...patch }));
  }, []);

  const clearFilters = useCallback(() => {
    setQuery((current) => ({
      search: "",
      cuisine: null,
      category: null,
      maxMinutes: null,
      sort: current.sort,
    }));
  }, []);

  const loadSuggestions = useCallback(() => {
    fetchJson<Recipe[]>("/api/recipes/suggestions")
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, []);

  useEffect(() => {
    loadSuggestions();
    // Expiring items affect both suggestions and Dive relevance — refresh both.
    return subscribeToPantryUpdates(() => {
      loadSuggestions();
      setRefreshKey((key) => key + 1);
    });
  }, [loadSuggestions]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.cuisine) params.set("cuisine", query.cuisine);
    if (query.category) params.set("category", query.category);
    if (query.maxMinutes) params.set("maxMinutes", String(query.maxMinutes));
    params.set("sort", query.sort);

    setError(null);
    fetchJson<Recipe[]>(`/api/recipes?${params.toString()}`)
      .then((data) => {
        setDiveRecipes(data);
        // Derive filter options once, from the first (unfiltered) load.
        if (!facetsLoaded.current) {
          setCuisineOptions(distinctValues(data, "cuisine"));
          setCategoryOptions(distinctValues(data, "category"));
          facetsLoaded.current = true;
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load recipes.");
        setLoading(false);
      });
  }, [query, refreshKey]);

  const hasActiveFilters =
    query.search !== "" ||
    query.cuisine !== null ||
    query.category !== null ||
    query.maxMinutes !== null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-terracotta-50 p-4 text-sm text-terracotta-600">
        {error}
      </div>
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
          />
        </div>

        {diveRecipes.length > 0 ? (
          <motion.div
            key={`${query.search}|${query.cuisine}|${query.category}|${query.maxMinutes}|${query.sort}`}
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 xl:gap-5"
          >
            {diveRecipes.map((recipe) => (
              <motion.div key={recipe.id} variants={item}>
                <RecipeCard recipe={recipe} onSelect={setSelectedRecipe} />
              </motion.div>
            ))}
          </motion.div>
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
