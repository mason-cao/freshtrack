"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Leaf, Percent } from "lucide-react";

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${prefix}${Math.round(v)}`);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    return controls.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
}

interface WeeklyHeroProps {
  used: number;
  wasted: number;
  saved: number;
}

export function WeeklyHero({ used, wasted, saved }: WeeklyHeroProps) {
  const total = used + wasted;
  const useRate = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
      className="rounded-2xl border border-warm-100 bg-warm-white p-5 shadow-warm sm:p-6 xl:p-7"
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sage-50 px-3 py-1 text-sm font-semibold text-sage-700">
            <Leaf className="h-4 w-4" />
            Weekly rhythm
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-stone-500">Logged food use rate</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-bold leading-none text-stone-900 xl:text-4xl">
                <AnimatedNumber value={useRate} />
              </span>
              <Percent className="h-5 w-5 text-sage-600" />
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
              {total > 0
                ? "Most of this week's logged food became meals instead of waste."
                : "Mark items used or wasted to start building your weekly signal."}
            </p>
          </div>
          <div className="mt-5 max-w-xl">
            <div className="h-2 overflow-hidden rounded-full bg-warm-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${useRate}%` }}
                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full rounded-full bg-sage-500"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs font-medium text-stone-500">
              <span>{used} used</span>
              <span>{wasted} wasted</span>
            </div>
          </div>
        </div>

        <dl className="grid overflow-hidden rounded-xl border border-warm-100 sm:grid-cols-3 lg:grid-cols-1">
          <div className="p-3 sm:border-r sm:border-warm-100 lg:border-b lg:border-r-0">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-sage-700">
              <TrendingUp className="h-4 w-4" />
              Used
            </dt>
            <dd className="mt-1 text-2xl font-bold text-stone-900 xl:text-3xl">
              <AnimatedNumber value={used} />
            </dd>
          </div>
          <div className="p-3 sm:border-r sm:border-warm-100 lg:border-b lg:border-r-0">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-terracotta-600">
              <TrendingDown className="h-4 w-4" />
              Wasted
            </dt>
            <dd className="mt-1 text-2xl font-bold text-stone-900 xl:text-3xl">
              <AnimatedNumber value={wasted} />
            </dd>
          </div>
          <div className="p-3">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
              <DollarSign className="h-4 w-4" />
              Saved
            </dt>
            <dd className="mt-1 text-2xl font-bold text-stone-900 xl:text-3xl">
              <AnimatedNumber value={saved} prefix="$" />
            </dd>
          </div>
        </dl>
      </div>
    </motion.div>
  );
}
