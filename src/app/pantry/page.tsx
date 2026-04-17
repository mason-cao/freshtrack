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
import { subscribeToPantryUpdates } from "@/lib/pantry-events";

interface Item {
  id: number;
  name: string;
  categoryIcon: string | null;
  categoryName: string | null;
  quantity: number;
  unit: string;
  purchaseDate: string;
  createdAt: string;
  expirationDate: string;
  estimatedCost: number | null;
}

export default function PantryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("expiry");
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(() => {
    setError(null);
    fetchJson<Item[]>("/api/items")
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

  if (loading) {
    return <PantrySkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-terracotta-50 p-4 text-sm text-terracotta-600">
        {error}
      </div>
    );
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
        <div className="hidden md:block">
          <AddItemDialog onItemAdded={loadItems} />
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-2 rounded-xl border border-warm-100 bg-warm-white p-2 shadow-warm-sm">
        {[
          { label: "Urgent", value: statusCounts.urgent, dot: "bg-terracotta-500", text: "text-terracotta-600" },
          { label: "Expiring", value: statusCounts.warning, dot: "bg-amber-500", text: "text-amber-700" },
          { label: "Fresh", value: statusCounts.fresh, dot: "bg-sage-500", text: "text-sage-700" },
          { label: "Expired", value: statusCounts.expired, dot: "bg-stone-400", text: "text-stone-500" },
        ].map((status) => (
          <div key={status.label} className="rounded-lg px-2 py-2 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              <span className={`text-lg font-bold leading-none ${status.text}`}>
                {status.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-stone-400">{status.label}</p>
          </div>
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
      />

      {/* Mobile: Card List */}
      <div className="space-y-2 md:hidden">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} onAction={loadItems} />
        ))}
        {filteredItems.length === 0 && (
          <p className="text-center text-sm text-stone-400 py-12">
            No items match your search
          </p>
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block">
        <ItemTable items={filteredItems} onAction={loadItems} filter="all" />
      </div>
    </div>
  );
}
