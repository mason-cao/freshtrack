"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { getFreshnessStatus, getDaysUntilExpiry } from "@/lib/freshness";
import { SearchFilterBar } from "@/components/pantry/search-filter-bar";
import { ItemCard } from "@/components/pantry/item-card";
import { ItemTable } from "@/components/pantry/item-table";
import { AddItemDialog } from "@/components/pantry/add-item-dialog";

interface Item {
  id: number;
  name: string;
  categoryIcon: string | null;
  categoryName: string | null;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expirationDate: string;
  estimatedCost: number | null;
}

export default function PantryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("expiry");

  const loadItems = useCallback(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

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
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        case "category":
          return (a.categoryName ?? "").localeCompare(b.categoryName ?? "");
        default:
          return 0;
      }
    });

    return result;
  }, [items, search, filter, sort]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-600" />
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
          <h1 className="text-2xl font-bold text-stone-900">My Pantry</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {items.length} item{items.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <div className="hidden md:block">
          <AddItemDialog onItemAdded={loadItems} />
        </div>
      </motion.div>

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
