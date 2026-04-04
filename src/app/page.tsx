"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDaysUntilExpiry } from "@/lib/freshness";
import { WeeklyHero } from "@/components/dashboard/weekly-hero";
import { StreakBadge } from "@/components/dashboard/streak-badge";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { ChefHat, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Item {
  id: number;
  name: string;
  categoryIcon: string | null;
  categoryName: string | null;
  quantity: number;
  unit: string;
  expirationDate: string;
}

interface Stats {
  totals: {
    consumed: number;
    wasted: number;
    wasteRate: number;
    moneySaved: number;
    wastedCost: number;
  };
}

interface RecipeSuggestion {
  id: number;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  matchingIngredients: string[];
}

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recipe, setRecipe] = useState<RecipeSuggestion | null>(null);
  const [loading, setLoading] = useState(true);

  function loadData() {
    Promise.all([
      fetch("/api/items").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/recipes/suggestions").then((r) => r.json()),
    ]).then(([itemsData, statsData, recipesData]) => {
      setItems(itemsData);
      setStats(statsData);
      setRecipe(recipesData?.[0] ?? null);
      setLoading(false);
    });
  }

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-600" />
      </div>
    );
  }

  const expiringSoon = items.filter((i) => {
    const days = getDaysUntilExpiry(i.expirationDate);
    return days >= 0 && days <= 2;
  }).sort((a, b) => getDaysUntilExpiry(a.expirationDate) - getDaysUntilExpiry(b.expirationDate));

  const expiringCount = items.filter((i) => {
    const days = getDaysUntilExpiry(i.expirationDate);
    return days >= 0 && days <= 5;
  }).length;

  return (
    <div className="space-y-6">
      {/* Greeting + Streak */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-start justify-between pt-2"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Good {getGreeting()}, Chef!
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {items.length === 0
              ? "Your pantry is empty. Add some items!"
              : `Tracking ${items.length} item${items.length !== 1 ? "s" : ""} in your pantry`}
          </p>
        </div>
        <StreakBadge days={stats?.totals.consumed ?? 0} />
      </motion.div>

      {/* Weekly Summary Hero */}
      {stats && (
        <WeeklyHero
          used={stats.totals.consumed}
          wasted={stats.totals.wasted}
          saved={Math.round(stats.totals.moneySaved)}
        />
      )}

      {/* Metric Cards */}
      <MetricCards
        activeItems={items.length}
        useRate={stats ? 100 - stats.totals.wasteRate : 0}
        expiringSoon={expiringCount}
      />

      {/* Needs Attention */}
      <NeedsAttention items={expiringSoon} onAction={loadData} />

      {/* Recipe Suggestion */}
      {recipe && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.4 }}
        >
          <Link href="/recipes" className="block group cursor-pointer">
            <div className="rounded-xl bg-warm-white p-5 shadow-warm transition-all duration-200 group-hover:shadow-warm-lg group-hover:translate-y-[-1px]">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-sage-50 p-2 shrink-0">
                  <ChefHat className="h-5 w-5 text-sage-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-sage-600 mb-1">
                    Try Tonight
                  </p>
                  <p className="font-semibold text-stone-900">{recipe.name}</p>
                  <p className="text-sm text-stone-500 mt-0.5 line-clamp-1">
                    {recipe.matchingIngredients.length > 0
                      ? `Uses your ${recipe.matchingIngredients.slice(0, 2).join(" and ")}`
                      : recipe.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-sage-600 transition-colors shrink-0 mt-1" />
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
