"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AddItemDialog } from "@/components/pantry/add-item-dialog";
import { ItemTable } from "@/components/pantry/item-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const filters = [
  { value: "all", label: "All Items" },
  { value: "urgent", label: "Urgent" },
  { value: "warning", label: "Expiring Soon" },
  { value: "fresh", label: "Fresh" },
  { value: "expired", label: "Expired" },
];

export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadItems = useCallback(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pantry"
        description="Manage your food inventory"
      >
        <AddItemDialog onItemAdded={loadItems} />
      </PageHeader>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={cn(
              filter === f.value ? "" : "text-gray-600"
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <ItemTable items={items} onAction={loadItems} filter={filter} />
    </div>
  );
}
