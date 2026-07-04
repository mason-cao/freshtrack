"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDaysUntilExpiry } from "@/lib/freshness";
import { fetchJson } from "@/lib/api-client";
import { subscribeToPantryUpdates } from "@/lib/pantry-events";
import { WeeklyHero } from "@/components/dashboard/weekly-hero";
import { StreakBadge } from "@/components/dashboard/streak-badge";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { ChefHat, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getRecipeHeroImage } from "@/lib/food-images";
import { toDateInputValue } from "@/lib/dates";
import type { PantryItem } from "@/lib/pantry";

interface Stats {
  monthly: Array<{
    month: string;
    monthLabel: string;
    consumed: number;
    wasted: number;
    consumedCost: number;
  }>;
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
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  imageUrl: string | null;
  matchingIngredients: string[];
}

export default function DashboardPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recipe, setRecipe] = useState<RecipeSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setError(null);
    Promise.all([
      fetchJson<PantryItem[]>("/api/items"),
      fetchJson<Stats>("/api/stats"),
      fetchJson<RecipeSuggestion[]>("/api/recipes/suggestions"),
    ]).then(([itemsData, statsData, recipesData]) => {
      setItems(itemsData);
      setStats(statsData);
      setRecipe(recipesData?.[0] ?? null);
      setLoading(false);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to load dashboard.");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadData();
    return subscribeToPantryUpdates(loadData);
  }, [loadData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-terracotta-50 p-4 text-sm text-terracotta-600">
        {error}
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

  // Scope the hero ledger to the current month; fall back to all-time totals
  // until this month has any logged activity.
  const currentMonthKey = toDateInputValue().slice(0, 7);
  const currentMonth = stats?.monthly.find((m) => m.month === currentMonthKey);
  const heroLedger = currentMonth
    ? {
        used: currentMonth.consumed,
        wasted: currentMonth.wasted,
        saved: Math.round(currentMonth.consumedCost),
        periodLabel: `This month · ${currentMonth.monthLabel}`,
        periodPhrase: "this month",
      }
    : {
        used: stats?.totals.consumed ?? 0,
        wasted: stats?.totals.wasted ?? 0,
        saved: Math.round(stats?.totals.moneySaved ?? 0),
        periodLabel: "All-time ledger",
        periodPhrase: "so far",
      };

  return (
    <div className="space-y-6 xl:space-y-0 xl:grid xl:grid-cols-12 xl:gap-6">
      {/* Greeting + Streak */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-start justify-between pt-2 xl:col-span-12"
      >
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-stone-900">
            Good {getGreeting()}, Chef!
          </h1>
          <p className="mt-1 text-sm xl:text-base text-stone-500">
            {items.length === 0
              ? "Your pantry is empty. Add some items!"
              : `Tracking ${items.length} item${items.length !== 1 ? "s" : ""} in your pantry`}
          </p>
        </div>
        <StreakBadge usedCount={stats?.totals.consumed ?? 0} />
      </motion.div>

      {/* Ledger Hero */}
      {stats && (
        <div className="xl:col-span-12">
          <WeeklyHero
            used={heroLedger.used}
            wasted={heroLedger.wasted}
            saved={heroLedger.saved}
            periodLabel={heroLedger.periodLabel}
            periodPhrase={heroLedger.periodPhrase}
          />
        </div>
      )}

      {/* Left Column: Metrics + Attention */}
      <div className="xl:col-span-7 space-y-6">
        {/* Metric Ledger */}
        <MetricCards
          items={items}
          useRate={stats ? 100 - stats.totals.wasteRate : 0}
          expiringCount={expiringCount}
        />

        {/* Needs Attention */}
        <NeedsAttention items={expiringSoon} onAction={loadData} />
      </div>

      {/* Right Column: Recipe Suggestion */}
      {recipe && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.4 }}
          className="xl:col-span-5 xl:row-span-2"
        >
          <Link href="/recipes" className="block group cursor-pointer h-full">
            <div className="h-full overflow-hidden rounded-2xl border border-warm-100 bg-warm-white shadow-warm transition-all duration-200 group-hover:translate-y-[-1px] group-hover:shadow-warm-lg">
              {/* Image banner — desktop */}
              <div className="hidden xl:block relative h-52 2xl:h-60 overflow-hidden bg-warm-50">
                <Image
                  src={recipe.imageUrl || getRecipeHeroImage(recipe.name)}
                  alt={recipe.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  sizes="(min-width: 1280px) 38vw, 33vw"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/35 via-stone-900/0 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-700 shadow-warm-sm">
                    <ChefHat className="h-3 w-3" /> Try tonight
                  </span>
                </div>
              </div>
              {/* Content */}
              <div className="p-5 xl:p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-sage-50 p-2 shrink-0 xl:hidden">
                    <ChefHat className="h-5 w-5 text-sage-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-sage-600 mb-1 xl:hidden">
                      Try Tonight
                    </p>
                    <p className="font-semibold text-stone-900 xl:text-lg">{recipe.name}</p>
                    <p className="text-sm text-stone-500 mt-1 line-clamp-1 xl:line-clamp-3">
                      {recipe.description}
                    </p>
                    {recipe.matchingIngredients.length > 0 && (
                      <div className="hidden xl:flex flex-wrap gap-1.5 mt-3">
                        {recipe.matchingIngredients.slice(0, 4).map((ing) => (
                          <span key={ing} className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            {ing}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-stone-400">
                      <Clock className="h-3 w-3" />
                      <span>{(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} min</span>
                      <ArrowRight className="h-3 w-3 ml-auto group-hover:text-sage-600 transition-colors" />
                    </div>
                  </div>
                </div>
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
