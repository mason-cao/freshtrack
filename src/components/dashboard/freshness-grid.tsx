"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import {
  getFreshnessStatus,
  getExpiryLabel,
  freshnessColor,
} from "@/lib/freshness";
import { getFoodImage } from "@/lib/food-images";

interface Item {
  id: number;
  name: string;
  categoryIcon: string | null;
  categoryName: string | null;
  quantity: number;
  unit: string;
  expirationDate: string;
}

interface FreshnessGridProps {
  items: Item[];
}

export function FreshnessGrid({ items }: FreshnessGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-warm-200 bg-warm-white/70 p-12 text-center">
        <Package className="mx-auto h-8 w-8 text-sage-500" />
        <p className="mt-3 font-medium text-stone-700">No items in your pantry yet.</p>
        <p className="mt-1 text-sm text-stone-500">
          Add items from the Pantry page to start tracking.
        </p>
      </div>
    );
  }

  // Sort: expired first, then urgent, warning, fresh
  const statusOrder = { expired: 0, urgent: 1, warning: 2, fresh: 3 };
  const sorted = [...items].sort((a, b) => {
    const statusA = getFreshnessStatus(a.expirationDate);
    const statusB = getFreshnessStatus(b.expirationDate);
    return statusOrder[statusA] - statusOrder[statusB];
  });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((item) => {
        const status = getFreshnessStatus(item.expirationDate);
        const colors = freshnessColor(status);
        const label = getExpiryLabel(item.expirationDate);
        const imageUrl = getFoodImage(item.name, item.categoryName);

        return (
          <Card
            key={item.id}
            className={`border bg-warm-white shadow-warm-sm transition-shadow duration-200 hover:shadow-warm ${colors.border}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 bg-warm-50 ${colors.border}`}>
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">{item.name}</p>
                    <p className="text-xs text-stone-500">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>
                <Badge className={colors.badge}>{label}</Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
