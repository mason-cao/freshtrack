"use client";

import { Badge } from "@/components/ui/badge";
import { ItemActions } from "./item-actions";
import {
  getFreshnessStatus,
  getExpiryLabel,
  freshnessColor,
} from "@/lib/freshness";
import { formatDate } from "@/lib/utils";

interface Item {
  id: number;
  name: string;
  categoryId?: number | null;
  categoryName: string | null;
  categoryIcon?: string | null;
  quantity: number;
  unit: string;
  purchaseDate?: string;
  expirationDate: string;
  status?: string;
  costEstimate?: number | null;
  estimatedCost?: number | null;
}

interface ItemTableProps {
  items: Item[];
  onAction: () => void;
  filter: string;
}

export function ItemTable({ items, onAction, filter }: ItemTableProps) {
  const filtered =
    filter === "all"
      ? items
      : items.filter(
          (item) => getFreshnessStatus(item.expirationDate) === filter
        );

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-warm-200 p-12 text-center">
        <p className="text-stone-400">No items found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-warm-white shadow-warm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-warm-100 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Purchased</th>
            <th className="px-4 py-3">Expiration</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-50">
          {filtered.map((item) => {
            const status = getFreshnessStatus(item.expirationDate);
            const colors = freshnessColor(status);

            return (
              <tr key={item.id} className="hover:bg-warm-50/50 transition-colors duration-150">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                    <span className="font-medium text-stone-900">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {item.categoryName ? (
                    <Badge variant="secondary" className="text-[10px]">
                      {item.categoryName}
                    </Badge>
                  ) : (
                    <span className="text-sm text-stone-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 py-3 text-sm text-stone-400">
                  {item.purchaseDate ? formatDate(item.purchaseDate) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${colors.badge} text-[10px]`}>
                    {getExpiryLabel(item.expirationDate)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <ItemActions
                    itemId={item.id}
                    itemName={item.name}
                    onAction={onAction}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
