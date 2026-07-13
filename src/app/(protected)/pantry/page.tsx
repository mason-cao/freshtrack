"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { getFreshnessStatus, getDaysUntilExpiry } from "@/lib/freshness";
import { SearchFilterBar } from "@/components/pantry/search-filter-bar";
import { ItemCard } from "@/components/pantry/item-card";
import { ItemTable } from "@/components/pantry/item-table";
import { AddItemDialog } from "@/components/pantry/add-item-dialog";
import { PantrySkeleton } from "@/components/pantry/pantry-skeleton";
import { fetchJson } from "@/lib/api-client";
import { notifyPantryUpdated, subscribeToPantryUpdates } from "@/lib/pantry-events";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PackageSearch, SearchX, Trash2 } from "lucide-react";
import type { PantryItem } from "@/lib/pantry";
import { ErrorState } from "@/components/ui/async-state";

const FIRST_FIVE_ITEMS_EVENT_KEY = "freshtrack:analytics:first-5-items-sent";

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("expiry");
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(() => {
    setError(null);
    fetchJson<PantryItem[]>("/api/items")
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load pantry.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadItems();
    return subscribeToPantryUpdates(loadItems);
  }, [loadItems]);

  useEffect(() => {
    if (items.length < 5) return;

    try {
      if (window.localStorage.getItem(FIRST_FIVE_ITEMS_EVENT_KEY) === "true") return;
      window.localStorage.setItem(FIRST_FIVE_ITEMS_EVENT_KEY, "true");
    } catch {
      return;
    }

    trackAnalyticsEvent("first_5_items_added");
  }, [items.length]);

  const filteredItems = useMemo(() => {
    let result = items;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.categoryName?.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filter !== "all") {
      result = result.filter((i) => getFreshnessStatus(i.expirationDate) === filter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "expiry":
          return getDaysUntilExpiry(a.expirationDate) - getDaysUntilExpiry(b.expirationDate);
        case "name":
          return a.name.localeCompare(b.name);
        case "added":
          return b.createdAt.localeCompare(a.createdAt);
        case "category":
          return (a.categoryName ?? "").localeCompare(b.categoryName ?? "");
        default:
          return 0;
      }
    });

    return result;
  }, [items, search, filter, sort]);

  const statusCounts = useMemo(() => {
    return items.reduce(
      (counts, item) => {
        counts[getFreshnessStatus(item.expirationDate)] += 1;
        return counts;
      },
      { fresh: 0, warning: 0, urgent: 0, expired: 0 }
    );
  }, [items]);
  const hasActiveFilters = search.trim().length > 0 || filter !== "all";

  function onStatusSummaryClick(nextFilter: string) {
    setFilter(filter === nextFilter ? "all" : nextFilter);
  }

  function clearFilters() {
    setSearch("");
    setFilter("all");
  }

  async function handleClearPantry() {
    await fetchJson("/api/account/pantry", { method: "DELETE" });
    notifyPantryUpdated();
    loadItems();
  }

  if (loading) {
    return <PantrySkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadItems} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-stone-900">My Pantry</h1>
          <p className="text-sm xl:text-base text-stone-500 mt-0.5">
            {items.length} item{items.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-stone-500 hover:bg-terracotta-50 hover:text-terracotta-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear pantry</span>
                </Button>
              }
              title="Clear your pantry?"
              description="This permanently deletes all your pantry items — active, consumed, and wasted. Your Stats history is kept. This can't be undone."
              confirmLabel="Clear pantry"
              pendingLabel="Clearing…"
              onConfirm={handleClearPantry}
            />
          )}
          <div className="hidden md:block">
            <AddItemDialog onItemAdded={loadItems} />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-warm-100 bg-warm-white p-2 shadow-warm-sm sm:grid-cols-4">
        {[
          { label: "Urgent", value: statusCounts.urgent, filterValue: "urgent", dot: "bg-terracotta-500", text: "text-terracotta-600", active: "bg-terracotta-50 ring-1 ring-terracotta-100" },
          { label: "Expiring", value: statusCounts.warning, filterValue: "warning", dot: "bg-amber-500", text: "text-amber-700", active: "bg-amber-50 ring-1 ring-amber-100" },
          { label: "Fresh", value: statusCounts.fresh, filterValue: "fresh", dot: "bg-sage-500", text: "text-sage-700", active: "bg-sage-50 ring-1 ring-sage-100" },
          { label: "Expired", value: statusCounts.expired, filterValue: "expired", dot: "bg-stone-400", text: "text-stone-500", active: "bg-warm-50 ring-1 ring-warm-100" },
        ].map((status) => (
          <button
            key={status.label}
            type="button"
            onClick={() => onStatusSummaryClick(status.filterValue)}
            aria-pressed={filter === status.filterValue}
            className={`rounded-lg px-2 py-2 text-center transition-colors duration-200 cursor-pointer hover:bg-warm-50 ${
              filter === status.filterValue ? status.active : ""
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              <span className={`text-lg font-bold leading-none ${status.text}`}>
                {status.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-stone-400">{status.label}</p>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        itemCount={filteredItems.length}
        filterCounts={{
          urgent: statusCounts.urgent,
          warning: statusCounts.warning,
          fresh: statusCounts.fresh,
          expired: statusCounts.expired,
        }}
      />

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-warm-200 bg-warm-white/70">
          <EmptyState
            icon={hasActiveFilters ? SearchX : PackageSearch}
            title={hasActiveFilters ? "No pantry matches" : "Your pantry is empty"}
            description={
              hasActiveFilters
                ? "Try a different search, clear the filters, or add the item if it is missing."
                : "Add items as you unpack groceries so FreshTrack can surface what needs attention first."
            }
            actionLabel={hasActiveFilters ? "Clear filters" : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
          />
        </div>
      ) : (
        <>
          {/* Mobile: Card List */}
          <div className="space-y-2 md:hidden">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onAction={loadItems} />
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block">
            <ItemTable items={filteredItems} onAction={loadItems} filter="all" />
          </div>
        </>
      )}
    </div>
  );
}
