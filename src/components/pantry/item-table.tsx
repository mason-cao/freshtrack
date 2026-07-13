"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ItemActions } from "./item-actions";
import {
  getFreshnessStatus,
  getExpiryLabel,
  freshnessColor,
} from "@/lib/freshness";
import { getFoodImage } from "@/lib/food-images";
import { formatDate } from "@/lib/utils";
import { FreshnessMeter } from "./freshness-meter";
import type { PantryActionOutcome } from "@/lib/pantry-events";
import type { PantryItem } from "@/lib/pantry";

interface ItemTableProps {
  items: PantryItem[];
  onAction: (outcome?: PantryActionOutcome) => void;
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
    <div className="overflow-x-auto rounded-xl border border-warm-100 bg-warm-white shadow-warm">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-warm-white">
          <tr className="border-b border-warm-100 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
            <th className="px-4 xl:px-5 py-3">Item</th>
            <th className="px-4 xl:px-5 py-3">Category</th>
            <th className="px-4 xl:px-5 py-3">Qty</th>
            <th className="px-4 xl:px-5 py-3">Purchased</th>
            <th className="px-4 xl:px-5 py-3">Expiration</th>
            <th className="px-4 xl:px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-50">
          {filtered.map((item) => {
            const status = getFreshnessStatus(item.expirationDate);
            const colors = freshnessColor(status);

            return (
              <tr key={item.id} className="hover:bg-warm-50/60 transition-colors duration-150">
                <td className="px-4 xl:px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg shrink-0 overflow-hidden border-2 bg-warm-50 ${colors.border}`}>
                      <Image
                        src={getFoodImage(item.name, item.categoryName)}
                        alt=""
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-stone-900">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 xl:px-5 py-3">
                  {item.categoryName ? (
                    <Badge variant="secondary" className="text-[10px]">
                      {item.categoryName}
                    </Badge>
                  ) : (
                    <span className="text-sm text-stone-400">—</span>
                  )}
                </td>
                <td className="px-4 xl:px-5 py-3 text-sm text-stone-600">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 xl:px-5 py-3 text-sm text-stone-400">
                  {item.purchaseDate ? formatDate(item.purchaseDate) : "—"}
                </td>
                <td className="px-4 xl:px-5 py-3">
                  <div className="min-w-[150px]">
                    <Badge className={`${colors.badge} text-[10px]`}>
                      {getExpiryLabel(item.expirationDate)}
                    </Badge>
                    <FreshnessMeter
                      expirationDate={item.expirationDate}
                      compact
                      className="mt-2"
                    />
                  </div>
                </td>
                <td className="px-4 xl:px-5 py-3 text-right">
                  <ItemActions
                    itemId={item.id}
                    itemName={item.name}
                    onAction={onAction}
                    item={item}
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
