"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WasteChart } from "@/components/stats/waste-chart";
import { CategoryBreakdown } from "@/components/stats/category-breakdown";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Leaf,
  Target,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchJson } from "@/lib/api-client";
import { getFoodImage } from "@/lib/food-images";

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

function WasteRateRing({ rate, dark = false }: { rate: number; dark?: boolean }) {
  const circumference = 2 * Math.PI * 40;
  const fillPercent = Math.min(rate, 100);
  const offset = circumference - (fillPercent / 100) * circumference;
  const isHigh = rate > 30;

  return (
    <div className="relative h-32 w-32 shrink-0 xl:h-36 xl:w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={dark ? "rgba(255,255,255,0.18)" : "#f5f0e8"}
          strokeWidth="8"
        />
        <motion.circle
          cx="50" cy="50" r="40" fill="none"
          stroke={isHigh ? "#f97316" : "#fcd34d"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold xl:text-4xl ${dark ? "text-white" : isHigh ? "text-terracotta-500" : "text-sage-600"}`}>
          {rate}%
        </span>
        <span className={dark ? "text-[10px] font-medium text-sage-100/80" : "text-[10px] text-stone-400"}>
          waste rate
        </span>
      </div>
    </div>
  );
}

function getUseRate(consumed: number, wasted: number) {
  const total = consumed + wasted;
  return total > 0 ? Math.round((consumed / total) * 100) : 0;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<StatsData>("/api/stats")
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load statistics.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-terracotta-50 p-4 text-sm text-terracotta-600">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const useRate = 100 - stats.totals.wasteRate;
  const latestMonth = stats.monthly.at(-1);
  const previousMonth = stats.monthly.at(-2);
  const latestUseRate = latestMonth
    ? getUseRate(latestMonth.consumed, latestMonth.wasted)
    : useRate;
  const previousUseRate = previousMonth
    ? getUseRate(previousMonth.consumed, previousMonth.wasted)
    : latestUseRate;
  const useRateDelta = latestUseRate - previousUseRate;
  const latestActions = latestMonth
    ? latestMonth.consumed + latestMonth.wasted
    : stats.totals.consumed + stats.totals.wasted;
  const latestWasteCost = latestMonth?.wastedCost ?? stats.totals.wastedCost;
  const previousWasteCost = previousMonth?.wastedCost ?? latestWasteCost;
  const wasteCostDelta = latestWasteCost - previousWasteCost;

  const kpis = [
    {
      label: "Consumed",
      value: stats.totals.consumed,
      detail: formatCurrency(stats.totals.consumedCost),
      icon: TrendingUp,
      tone: "sage",
    },
    {
      label: "Wasted",
      value: stats.totals.wasted,
      detail: formatCurrency(stats.totals.wastedCost),
      icon: TrendingDown,
      tone: "terracotta",
    },
    {
      label: "Use rate",
      value: `${useRate}%`,
      detail: useRate > 70 ? "Strong habit" : "Room to improve",
      icon: Leaf,
      tone: "sage",
    },
    {
      label: "Saved",
      value: formatCurrency(stats.totals.moneySaved),
      detail: "Total value consumed",
      icon: DollarSign,
      tone: "amber",
    },
  ];

  return (
    <div className="space-y-6 xl:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative overflow-hidden rounded-2xl bg-sage-800 px-5 py-6 text-white shadow-warm-lg sm:px-6 xl:p-8"
      >
        <div className="absolute inset-0">
          <Image
            src={getFoodImage("seasonal produce", "Produce")}
            alt=""
            fill
            priority
            className="object-cover opacity-25"
            sizes="(min-width: 1280px) 70vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sage-900 via-sage-800/95 to-sage-700/75" />
        </div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-sage-50 backdrop-blur-sm">
              <BarChart3 className="h-4 w-4 text-sage-200" />
              Waste intelligence
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight xl:text-5xl">
              Statistics
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-sage-100/85 xl:text-base">
              Track how much food gets used, what it saves, and where waste is
              still costing you.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-medium text-sage-100">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Latest month
                </div>
                <p className="mt-2 text-lg font-bold text-white">
                  {latestMonth?.monthLabel ?? "No data"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-medium text-sage-100">
                  <Target className="h-3.5 w-3.5" />
                  Use rate trend
                </div>
                <p className="mt-2 flex items-center gap-1 text-lg font-bold text-white">
                  {useRateDelta >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-amber-300" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-terracotta-100" />
                  )}
                  {Math.abs(useRateDelta)} pts
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-medium text-sage-100">
                  <DollarSign className="h-3.5 w-3.5" />
                  Waste cost shift
                </div>
                <p className="mt-2 flex items-center gap-1 text-lg font-bold text-white">
                  {wasteCostDelta <= 0 ? (
                    <ArrowDownRight className="h-4 w-4 text-amber-300" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-terracotta-100" />
                  )}
                  {formatCurrency(Math.abs(wasteCostDelta))}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <WasteRateRing rate={stats.totals.wasteRate} dark />
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        {kpis.map((stat) => {
          const Icon = stat.icon;
          const toneClasses =
            stat.tone === "terracotta"
              ? {
                  rail: "bg-terracotta-500",
                  iconBg: "bg-terracotta-50",
                  icon: "text-terracotta-500",
                  value: "text-stone-900",
                }
              : stat.tone === "amber"
                ? {
                    rail: "bg-amber-500",
                    iconBg: "bg-amber-50",
                    icon: "text-amber-600",
                    value: "text-amber-700",
                  }
                : {
                    rail: "bg-sage-500",
                    iconBg: "bg-sage-50",
                    icon: "text-sage-600",
                    value: "text-stone-900",
                  };

          return (
            <motion.div
              key={stat.label}
              variants={item}
              className="relative overflow-hidden rounded-xl border border-warm-100 bg-warm-white p-4 shadow-warm-sm transition-shadow duration-200 hover:shadow-warm xl:p-5"
            >
              <div className={`absolute inset-x-0 top-0 h-1 ${toneClasses.rail}`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-stone-400">{stat.label}</p>
                  <p className={`mt-2 text-2xl font-bold leading-none xl:text-3xl ${toneClasses.value}`}>
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs text-stone-500">{stat.detail}</p>
                </div>
                <div className={`rounded-lg p-2 ${toneClasses.iconBg}`}>
                  <Icon className={`h-4 w-4 ${toneClasses.icon}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        variants={item}
        initial="hidden"
        animate="show"
        className="grid gap-3 rounded-2xl border border-warm-100 bg-warm-white p-4 shadow-warm sm:grid-cols-3 xl:p-5"
      >
        <div className="rounded-xl bg-sage-50 p-4">
          <p className="text-xs font-medium text-sage-700">Latest activity</p>
          <p className="mt-2 text-2xl font-bold text-stone-900">{latestActions}</p>
          <p className="text-xs text-stone-500">items logged this month</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-700">Current use rate</p>
          <p className="mt-2 text-2xl font-bold text-stone-900">{latestUseRate}%</p>
          <p className="text-xs text-stone-500">for {latestMonth?.monthLabel ?? "latest month"}</p>
        </div>
        <div className="rounded-xl bg-terracotta-50 p-4">
          <p className="text-xs font-medium text-terracotta-600">Wasted value</p>
          <p className="mt-2 text-2xl font-bold text-stone-900">
            {formatCurrency(latestWasteCost)}
          </p>
          <p className="text-xs text-stone-500">for {latestMonth?.monthLabel ?? "latest month"}</p>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:gap-8"
      >
        <Card className="overflow-hidden border border-warm-100 shadow-warm">
          <CardHeader className="border-b border-warm-100 bg-warm-white/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Consumption vs Waste</CardTitle>
                <CardDescription className="mt-1">
                  Monthly item outcomes over time
                </CardDescription>
              </div>
              <div className="rounded-lg bg-sage-50 p-2">
                <BarChart3 className="h-4 w-4 text-sage-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-5 xl:p-6">
            <WasteChart data={stats.monthly} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-warm-100 shadow-warm">
          <CardHeader className="border-b border-warm-100 bg-warm-white/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription className="mt-1">
                  Value saved compared with value wasted
                </CardDescription>
              </div>
              <div className="rounded-lg bg-amber-50 p-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-5 xl:p-6">
            <CategoryBreakdown data={stats.monthly} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
