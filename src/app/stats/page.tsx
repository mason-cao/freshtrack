"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WasteChart } from "@/components/stats/waste-chart";
import { CategoryBreakdown } from "@/components/stats/category-breakdown";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MonthlyData {
  month: string;
  monthLabel: string;
  consumed: number;
  wasted: number;
  consumedCost: number;
  wastedCost: number;
}

interface StatsData {
  monthly: MonthlyData[];
  totals: {
    consumed: number;
    wasted: number;
    consumedCost: number;
    wastedCost: number;
    wasteRate: number;
    moneySaved: number;
  };
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Consumed",
      value: stats.totals.consumed,
      subtitle: formatCurrency(stats.totals.consumedCost),
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total Wasted",
      value: stats.totals.wasted,
      subtitle: formatCurrency(stats.totals.wastedCost),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Waste Rate",
      value: `${stats.totals.wasteRate}%`,
      subtitle: stats.totals.wasteRate > 30 ? "Above average" : "Below average",
      icon: Percent,
      color: stats.totals.wasteRate > 30 ? "text-red-600" : "text-emerald-600",
      bgColor: stats.totals.wasteRate > 30 ? "bg-red-50" : "bg-emerald-50",
    },
    {
      title: "Food Saved Value",
      value: formatCurrency(stats.totals.moneySaved),
      subtitle: "Total consumed food value",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Statistics"
        description="Track your food waste trends and savings"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${card.bgColor}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{card.title}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-400">{card.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Consumption vs Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <WasteChart data={stats.monthly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown data={stats.monthly} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
