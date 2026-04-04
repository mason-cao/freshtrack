"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WasteChart } from "@/components/stats/waste-chart";
import { CategoryBreakdown } from "@/components/stats/category-breakdown";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Leaf,
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

function WasteRateRing({ rate }: { rate: number }) {
  const circumference = 2 * Math.PI * 40;
  const fillPercent = Math.min(rate, 100);
  const offset = circumference - (fillPercent / 100) * circumference;
  const isHigh = rate > 30;

  return (
    <div className="relative h-28 w-28 xl:h-32 xl:w-32 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f5f0e8" strokeWidth="8" />
        <motion.circle
          cx="50" cy="50" r="40" fill="none"
          stroke={isHigh ? "#c2410c" : "#527a52"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl xl:text-3xl font-bold ${isHigh ? "text-terracotta-500" : "text-sage-600"}`}>
          {rate}%
        </span>
        <span className="text-[10px] text-stone-400">waste rate</span>
      </div>
    </div>
  );
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-600" />
      </div>
    );
  }

  const useRate = 100 - stats.totals.wasteRate;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h1 className="text-2xl font-bold text-stone-900">Statistics</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Track your food waste trends and savings
        </p>
      </motion.div>

      {/* Stats Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        className="rounded-2xl bg-warm-white p-6 xl:p-8 shadow-warm"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 xl:gap-10">
          <WasteRateRing rate={stats.totals.wasteRate} />
          <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-sage-50 p-1.5">
                  <TrendingUp className="h-4 w-4 text-sage-600" />
                </div>
                <span className="text-xs text-stone-400">Consumed</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold text-stone-900">{stats.totals.consumed}</p>
              <p className="text-xs text-stone-400 mt-0.5">{formatCurrency(stats.totals.consumedCost)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-terracotta-50 p-1.5">
                  <TrendingDown className="h-4 w-4 text-terracotta-500" />
                </div>
                <span className="text-xs text-stone-400">Wasted</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold text-stone-900">{stats.totals.wasted}</p>
              <p className="text-xs text-stone-400 mt-0.5">{formatCurrency(stats.totals.wastedCost)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-sage-50 p-1.5">
                  <Leaf className="h-4 w-4 text-sage-600" />
                </div>
                <span className="text-xs text-stone-400">Use Rate</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold text-sage-600">{useRate}%</p>
              <p className="text-xs text-stone-400 mt-0.5">{useRate > 70 ? "Great job!" : "Room to improve"}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-amber-50 p-1.5">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-xs text-stone-400">Saved</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold text-amber-600">{formatCurrency(stats.totals.moneySaved)}</p>
              <p className="text-xs text-stone-400 mt-0.5">Total value consumed</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:gap-8"
      >
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
      </motion.div>
    </div>
  );
}
