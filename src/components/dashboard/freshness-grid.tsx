"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getFreshnessStatus,
  getExpiryLabel,
  freshnessColor,
} from "@/lib/freshness";

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
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
        <p className="text-gray-500">No items in your pantry yet.</p>
        <p className="mt-1 text-sm text-gray-400">
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

        return (
          <Card
            key={item.id}
            className={`${colors.bg} ${colors.border} border transition-shadow hover:shadow-md`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.categoryIcon || "📦"}</span>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
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
