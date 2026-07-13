"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, animate } from "framer-motion";
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
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchJson } from "@/lib/api-client";
import { subscribeToPantryUpdates } from "@/lib/pantry-events";
import { ErrorState, LoadingState } from "@/components/ui/async-state";

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
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cell = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 30 },
  },
};

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(
    count,
    (v) => `${prefix}${Math.round(v)}${suffix}`,
  );

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [count, reduceMotion, value]);

  return <motion.span>{rounded}</motion.span>;
}

function WasteRateRing({ rate }: { rate: number }) {
  const circumference = 2 * Math.PI * 42;
  const fillPercent = Math.min(rate, 100);
  const offset = circumference - (fillPercent / 100) * circumference;
  // Two-tier semantic color, intuitive direction:
  // low waste = sage (calm), high waste = terracotta (alert).
  const isHigh = rate > 25;
  const ringColor = isHigh ? "#c2410c" : "#527a52";
  const centerColor = isHigh ? "text-terracotta-600" : "text-sage-600";

  return (
    <div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44 xl:h-48 xl:w-48">
      <svg aria-hidden="true" focusable="false" className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#f3ead8"
          strokeWidth="6"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={ringColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`num text-[42px] font-bold leading-none tracking-[-0.02em] xl:text-5xl ${centerColor}`}
        >
          <AnimatedNumber value={rate} suffix="%" />
        </span>
        <span className="eyebrow mt-1.5 text-stone-500">Waste rate</span>
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

  const loadStats = useCallback(() => {
    setError(null);
    fetchJson<StatsData>("/api/stats")
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Unable to load statistics.",
        );
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadStats();
    return subscribeToPantryUpdates(loadStats);
  }, [loadStats]);

  if (loading) {
    return <LoadingState label="Loading statistics" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadStats} />;
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

  const headlineQualifier =
    useRate >= 85
      ? "Most of what you logged became meals, not waste."
      : useRate >= 65
        ? "More than half of your logged food found a meal."
        : useRate > 0
          ? "There's room to use more of what you log."
          : "Mark items used or wasted to start your ledger.";

  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Editorial hero */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="relative overflow-hidden rounded-3xl border border-warm-100 bg-warm-white p-6 shadow-warm sm:p-8 xl:p-10"
      >
        <h1 className="eyebrow text-stone-500">
          Statistics · {stats.monthly.length > 0
            ? `${stats.monthly.length} active month${stats.monthly.length === 1 ? "" : "s"}`
            : "no activity yet"}
        </h1>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.3fr_auto] lg:gap-10">
          <div>
            <p className="eyebrow text-sage-700">Use rate</p>
            <div className="mt-3 flex items-end gap-2">
              <motion.span
                initial={{ scale: 1.03, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.18,
                }}
                className="num font-bold leading-[0.85] tracking-[-0.03em] text-stone-900 text-[clamp(3.5rem,9vw,6rem)]"
              >
                <AnimatedNumber value={useRate} />
              </motion.span>
              <span className="pb-3 text-3xl font-semibold text-stone-400">
                %
              </span>
            </div>

            {latestMonth && previousMonth && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium">
                {useRateDelta >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-sage-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-terracotta-500" />
                )}
                <span
                  className={
                    useRateDelta >= 0
                      ? "text-sage-700"
                      : "text-terracotta-600"
                  }
                >
                  {Math.abs(useRateDelta)} pts
                </span>
                <span className="text-stone-500">
                  vs. {previousMonth.monthLabel}
                </span>
              </div>
            )}

            <p className="mt-4 max-w-md text-base leading-7 text-stone-600 xl:text-lg xl:leading-8">
              {headlineQualifier}
            </p>
          </div>

          <div className="flex justify-center lg:justify-end lg:pt-2">
            <WasteRateRing rate={stats.totals.wasteRate} />
          </div>
        </div>

        {/* Hairline + inline ledger row */}
        <div className="mt-8 border-t border-warm-100 pt-6 xl:mt-10 xl:pt-7">
          <motion.dl
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-warm-100"
          >
            <motion.div
              variants={cell}
              className="sm:px-5 sm:first:pl-0 sm:last:pr-0"
            >
              <dt className="eyebrow text-stone-500">Consumed</dt>
              <dd className="num mt-2 text-3xl font-bold tracking-[-0.02em] text-stone-900 xl:text-4xl">
                <AnimatedNumber value={stats.totals.consumed} />
              </dd>
              <dd className="mt-1 text-xs text-stone-500">
                {formatCurrency(stats.totals.consumedCost)} value
              </dd>
            </motion.div>

            <motion.div variants={cell} className="sm:px-5">
              <dt className="eyebrow text-stone-500">Wasted</dt>
              <dd className="num mt-2 text-3xl font-bold tracking-[-0.02em] text-stone-900 xl:text-4xl">
                <AnimatedNumber value={stats.totals.wasted} />
              </dd>
              <dd className="mt-1 text-xs text-stone-500">
                {formatCurrency(stats.totals.wastedCost)} lost
              </dd>
            </motion.div>

            <motion.div variants={cell} className="sm:px-5">
              <dt className="eyebrow text-amber-700">Saved</dt>
              <dd className="num mt-2 text-3xl font-bold tracking-[-0.02em] text-amber-700 xl:text-4xl">
                {formatCurrency(stats.totals.moneySaved)}
              </dd>
              <dd className="mt-1 text-xs text-stone-500">
                total value consumed
              </dd>
            </motion.div>

            <motion.div variants={cell} className="sm:px-5 sm:last:pr-0">
              <dt className="eyebrow text-stone-500">
                {latestMonth?.monthLabel ?? "This month"}
              </dt>
              <dd className="num mt-2 text-3xl font-bold tracking-[-0.02em] text-stone-900 xl:text-4xl">
                <AnimatedNumber value={latestActions} />
              </dd>
              <dd className="mt-1 text-xs text-stone-500">
                actions · {formatCurrency(latestWasteCost)} wasted
              </dd>
            </motion.div>
          </motion.dl>
        </div>
      </motion.section>

      {/* Charts */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:gap-8"
      >
        <Card className="overflow-hidden border border-warm-100 shadow-warm">
          <CardHeader className="border-b border-warm-100 bg-warm-white">
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
          <CardHeader className="border-b border-warm-100 bg-warm-white">
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
