"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { RecipeDiveBar } from "@/components/recipes/recipe-dive-bar";
import { BookOpen, Compass, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchJson } from "@/lib/api-client";
import { subscribeToPantryUpdates } from "@/lib/pantry-events";
import { ErrorState, LoadingState } from "@/components/ui/async-state";

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

interface RecipeFacets {
  cuisines: string[];
  categories: string[];
}

interface RecipeResultsResponse {
  recipes: Recipe[];
  total: number;
  limit: number;
  offset: number;
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

export default function RecipesPage() {
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [diveRecipes, setDiveRecipes] = useState<Recipe[]>([]);
  const [cuisineOptions, setCuisineOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [diveOffset, setDiveOffset] = useState(0);
  const [diveTotal, setDiveTotal] = useState(0);

  const [query, setQuery] = useState<DiveQuery>({
    search: "",
    cuisine: null,
    category: null,
    maxMinutes: null,
    sort: "relevance",
  });

  const updateQuery = useCallback((patch: Partial<DiveQuery>) => {
    setQuery((current) => ({ ...current, ...patch }));
    setDiveOffset(0);
  }, []);

  const clearFilters = useCallback(() => {
    setQuery((current) => ({
      search: "",
      cuisine: null,
      category: null,
      maxMinutes: null,
      sort: current.sort,
    }));
    setDiveOffset(0);
  }, []);

  const loadSuggestions = useCallback(() => {
    fetchJson<Recipe[]>("/api/recipes/suggestions")
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, []);

  useEffect(() => {
    loadSuggestions();
    // Expiring items affect both suggestions and Dive relevance — refresh both.
    // Reset paging too: refetching with a stale offset would append rows the
    // list already shows.
    return subscribeToPantryUpdates(() => {
      loadSuggestions();
      setDiveOffset(0);
      setRefreshKey((key) => key + 1);
    });
  }, [loadSuggestions]);

  useEffect(() => {
    fetchJson<RecipeFacets>("/api/recipes/facets")
      .then((facets) => {
        setCuisineOptions(facets.cuisines);
        setCategoryOptions(facets.categories);
      })
      .catch(() => {
        setCuisineOptions([]);
        setCategoryOptions([]);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.cuisine) params.set("cuisine", query.cuisine);
    if (query.category) params.set("category", query.category);
    if (query.maxMinutes) params.set("maxMinutes", String(query.maxMinutes));
    params.set("sort", query.sort);
    if (diveOffset > 0) params.set("offset", String(diveOffset));

    setError(null);
    if (diveOffset > 0) {
      setLoadingMore(true);
    } else {
      setSearching(true);
    }

    let cancelled = false;

    fetchJson<RecipeResultsResponse>(`/api/recipes?${params.toString()}`)
      .then((data) => {
        if (cancelled) return;
        setDiveRecipes((current) =>
          data.offset === 0 ? data.recipes : [...current, ...data.recipes]
        );
        setDiveTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load recipes.");
        setLoading(false);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingMore(false);
        setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, refreshKey, diveOffset]);

  const hasActiveFilters =
    query.search !== "" ||
    query.cuisine !== null ||
    query.category !== null ||
    query.maxMinutes !== null;
  const canShowMore = diveRecipes.length < diveTotal;

  if (loading) {
    return <LoadingState label="Loading recipes" />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setDiveOffset(0);
          setRefreshKey((key) => key + 1);
        }}
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
                  onClick={() => setDiveOffset(diveRecipes.length)}
                  disabled={loadingMore}
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
