"use client";

import { Badge } from "@/components/ui/badge";
import { ItemActions } from "./item-actions";
import {
  getFreshnessStatus,
  getExpiryLabel,
  freshnessColor,
} from "@/lib/freshness";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Item {
  id: number;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  categoryIcon: string | null;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expirationDate: string;
  status: string;
  costEstimate: number | null;
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
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
        <p className="text-gray-500">No items found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Purchased</th>
            <th className="px-4 py-3">Expiration</th>
            <th className="px-4 py-3">Cost</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((item) => {
            const status = getFreshnessStatus(item.expirationDate);
            const colors = freshnessColor(status);

            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
                    <span className="font-medium text-gray-900">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {item.categoryIcon} {item.categoryName || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(item.purchaseDate)}
                </td>
                <td className="px-4 py-3">
                  <Badge className={colors.badge}>
                    {getExpiryLabel(item.expirationDate)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {item.costEstimate
                    ? formatCurrency(item.costEstimate)
                    : "—"}
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
