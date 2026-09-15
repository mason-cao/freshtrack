"use client";

import { useCallback, useState } from "react";
import { fetchJson } from "@/lib/api-client";
import { itemFormValues, type ItemFormValues } from "@/lib/item-form";
import type { PantryCategory, PantryItem } from "@/lib/pantry";
import { useResource } from "./use-resource";

const loadCategories = (signal: AbortSignal) =>
  fetchJson<PantryCategory[]>("/api/categories", { signal });

export function useItemForm(item?: PantryItem) {
  const [values, setValues] = useState(() => itemFormValues(item));
  const setField = useCallback((field: keyof ItemFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);
  return { values, setValues, setField };
}

export function useCategories(open: boolean) {
  return useResource(loadCategories, { enabled: open });
}
