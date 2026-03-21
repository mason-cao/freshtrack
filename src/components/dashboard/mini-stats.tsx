"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, DollarSign, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MiniStatsProps {
  consumed: number;
  wasted: number;
  wasteRate: number;
  moneySaved: number;
}

export function MiniStats({ consumed, wasted, wasteRate, moneySaved }: MiniStatsProps) {
  const stats = [
    {
      label: "Items Consumed",
      value: consumed,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Items Wasted",
      value: wasted,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Waste Rate",
      value: `${wasteRate}%`,
      icon: Percent,
      color: wasteRate > 30 ? "text-red-600" : "text-amber-600",
      bgColor: wasteRate > 30 ? "bg-red-50" : "bg-amber-50",
    },
    {
      label: "Food Saved Value",
      value: formatCurrency(moneySaved),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
