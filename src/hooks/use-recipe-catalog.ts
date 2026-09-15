"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/lib/api-client";
import { subscribeToPantryUpdates } from "@/lib/pantry-events";
import { uniqueRecipeRows } from "@/lib/recipe-results";
import { MAX_RECIPE_QUERY_OFFSET } from "@/lib/recipe-query";
import type { Recipe, RecipeFilters, RecipeFacets, RecipeResultsResponse } from "@/lib/recipes";
import { useResource } from "./use-resource";

const loadSuggestions = (signal: AbortSignal) => fetchJson<Recipe[]>("/api/recipes/suggestions", { signal });
const loadFacets = (signal: AbortSignal) => fetchJson<RecipeFacets>("/api/recipes/facets", { signal });

export function useRecipeCatalog() {
  const [diveRecipes, setDiveRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [diveOffset, setDiveOffset] = useState(0);
  const [diveTotal, setDiveTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState(0);

  const [query, setQuery] = useState<RecipeFilters>({
    search: "",
    cuisine: null,
    category: null,
    maxMinutes: null,
    sort: "relevance",
  });

  const updateQuery = useCallback((patch: Partial<RecipeFilters>) => {
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

  const { data: suggestions = [] } = useResource(loadSuggestions, { subscribe: subscribeToPantryUpdates });
  const { data: facets } = useResource(loadFacets);
  const refresh = useCallback(() => {
    setDiveOffset(0);
    setRefreshKey((key) => key + 1);
  }, []);
  useEffect(() => subscribeToPantryUpdates(refresh), [refresh]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.cuisine) params.set("cuisine", query.cuisine);
    if (query.category) params.set("category", query.category);
    if (query.maxMinutes) params.set("maxMinutes", String(query.maxMinutes));
    params.set("sort", query.sort);
    if (diveOffset > 0) params.set("offset", String(diveOffset));

    setError(null);
    setLoadingMore(diveOffset > 0);
    setSearching(diveOffset === 0);

    const controller = new AbortController();

    fetchJson<RecipeResultsResponse>(`/api/recipes?${params.toString()}`, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setDiveRecipes((current) => data.offset === 0 ? data.recipes : uniqueRecipeRows(current, data.recipes));
        setDiveTotal(data.total);
        setNextOffset(data.offset + data.recipes.length);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unable to load recipes.");
        setLoading(false);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoadingMore(false);
        setSearching(false);
      });

    return () => {
      controller.abort();
    };
  }, [query, refreshKey, diveOffset]);

  const hasActiveFilters =
    query.search !== "" ||
    query.cuisine !== null ||
    query.category !== null ||
    query.maxMinutes !== null;
  const canShowMore = nextOffset > diveOffset && nextOffset < diveTotal && nextOffset <= MAX_RECIPE_QUERY_OFFSET;

  return {
    suggestions, diveRecipes, cuisineOptions: facets?.cuisines ?? [], categoryOptions: facets?.categories ?? [],
    query, updateQuery, clearFilters, loading, loadingMore, searching, error, diveTotal, hasActiveFilters, canShowMore,
    refresh, showMore: () => { if (canShowMore && !searching && !loadingMore) setDiveOffset(nextOffset); },
  };
}
