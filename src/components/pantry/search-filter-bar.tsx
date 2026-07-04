"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const filters = [
  { value: "all", label: "All" },
  { value: "urgent", label: "Urgent" },
  { value: "warning", label: "Expiring" },
  { value: "fresh", label: "Fresh" },
  { value: "expired", label: "Expired" },
];

const sortOptions = [
  { value: "expiry", label: "Expiry Date" },
  { value: "name", label: "Name" },
  { value: "added", label: "Date Added" },
  { value: "category", label: "Category" },
];

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  itemCount: number;
  filterCounts?: Record<string, number>;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  itemCount,
  filterCounts,
}: SearchFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const debouncedSearch = useCallback(
    (value: string) => {
      const timer = setTimeout(() => onSearchChange(value), 300);
      return () => clearTimeout(timer);
    },
    [onSearchChange]
  );

  useEffect(() => {
    const cleanup = debouncedSearch(localSearch);
    return cleanup;
  }, [localSearch, debouncedSearch]);

  const totalCount =
    filterCounts
      ? filters.reduce((total, f) => {
          if (f.value === "all") return total;
          return total + (filterCounts[f.value] ?? 0);
        }, 0)
      : itemCount;

  function clearSearch() {
    setLocalSearch("");
    onSearchChange("");
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search items..."
          aria-label="Search pantry items"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full rounded-xl border-0 bg-warm-white py-2.5 pl-10 pr-20 text-sm text-stone-900 shadow-warm-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-500/40"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {localSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-full p-1 text-stone-400 transition-colors duration-200 hover:bg-warm-50 hover:text-stone-700 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="text-xs text-stone-400">
            {itemCount} items
          </span>
        </div>
      </div>

      {/* Filters + Sort */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex gap-1.5 shrink-0">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onFilterChange(f.value)}
              aria-pressed={filter === f.value}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap",
                filter === f.value
                  ? "text-white"
                  : "text-stone-600 hover:bg-warm-50"
              )}
            >
              {filter === f.value && (
                <motion.div
                  layoutId="filter-chip"
                  className="absolute inset-0 rounded-full bg-sage-500"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] leading-none",
                    filter === f.value ? "bg-white/20 text-white" : "bg-warm-50 text-stone-400"
                  )}
                >
                  {f.value === "all" ? totalCount : filterCounts?.[f.value] ?? 0}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="ml-auto shrink-0 flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-stone-400" />
          <Select value={sort} onValueChange={onSortChange}>
            <SelectTrigger className="h-8 w-[130px] border-0 bg-transparent text-xs shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
