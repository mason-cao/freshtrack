"use client";

import { useEffect, useState } from "react";
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

const TIME_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Any time" },
  { value: 15, label: "≤15 min" },
  { value: 30, label: "≤30 min" },
  { value: 60, label: "≤60 min" },
];

const SORT_OPTIONS: { value: "relevance" | "name"; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "name", label: "A–Z" },
];

// Radix Select has no null value, so a sentinel stands in for "no filter".
const ALL = "__all__";

interface RecipeDiveBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  cuisine: string | null;
  onCuisineChange: (value: string | null) => void;
  cuisineOptions: string[];
  category: string | null;
  onCategoryChange: (value: string | null) => void;
  categoryOptions: string[];
  maxMinutes: number | null;
  onMaxMinutesChange: (value: number | null) => void;
  sort: "relevance" | "name";
  onSortChange: (value: "relevance" | "name") => void;
  resultCount: number;
  resultTotal: number;
}

export function RecipeDiveBar({
  search,
  onSearchChange,
  cuisine,
  onCuisineChange,
  cuisineOptions,
  category,
  onCategoryChange,
  categoryOptions,
  maxMinutes,
  onMaxMinutesChange,
  sort,
  onSortChange,
  resultCount,
  resultTotal,
}: RecipeDiveBarProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const resultLabel =
    resultTotal > resultCount
      ? `${resultCount}/${resultTotal} recipes`
      : `${resultCount} recipes`;

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(localSearch), 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search recipes..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full rounded-xl border-0 bg-warm-white py-2.5 pl-10 pr-24 text-sm text-stone-900 shadow-warm-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-500/40"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="rounded-full p-1 text-stone-400 transition-colors duration-200 hover:bg-warm-50 hover:text-stone-700 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="whitespace-nowrap text-xs text-stone-400">{resultLabel}</span>
        </div>
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-wrap items-center gap-2">
        {cuisineOptions.length > 0 && (
          <Select
            value={cuisine ?? ALL}
            onValueChange={(value) => onCuisineChange(value === ALL ? null : value)}
          >
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue placeholder="All cuisines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All cuisines</SelectItem>
              {cuisineOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {categoryOptions.length > 0 && (
          <Select
            value={category ?? ALL}
            onValueChange={(value) => onCategoryChange(value === ALL ? null : value)}
          >
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Max-time pills */}
        <div className="flex gap-1.5">
          {TIME_OPTIONS.map((option) => {
            const active = maxMinutes === option.value;
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => onMaxMinutesChange(option.value)}
                aria-pressed={active}
                className={cn(
                  "relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap",
                  active ? "text-white" : "text-stone-600 hover:bg-warm-50"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="dive-time-chip"
                    className="absolute inset-0 rounded-full bg-sage-500"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-stone-400" />
          <Select value={sort} onValueChange={(value) => onSortChange(value as "relevance" | "name")}>
            <SelectTrigger className="h-8 w-[130px] border-0 bg-transparent text-xs shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
