"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface MetricCardsProps {
  items: Array<{ categoryName: string | null }>;
  useRate: number;
  expiringCount: number;
}

const enterCell = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 30 },
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

function getUseRateQualifier(rate: number, total: number) {
  if (total === 0) return "Early days";
  if (rate >= 85) return "Strong habit";
  if (rate >= 65) return "Holding steady";
  return "Room to improve";
}

function getExpiringQualifier(count: number) {
  if (count === 0) return "All clear";
  if (count <= 2) return "Small list, easy day";
  return "Plan a use-it-up meal";
}

export function MetricCards({ items, useRate, expiringCount }: MetricCardsProps) {
  const totalItems = items.length;

  const topCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const key = item.categoryName ?? "Uncategorized";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [items]);

  const useQualifier = getUseRateQualifier(useRate, totalItems);
  const expiringQualifier = getExpiringQualifier(expiringCount);
  const expiringTone =
    expiringCount === 0
      ? "text-stone-900"
      : expiringCount <= 2
        ? "text-amber-700"
        : "text-terracotta-600";

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-2xl border border-warm-100 bg-warm-white shadow-warm"
    >
      <div className="grid grid-cols-1 divide-y divide-warm-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {/* In rotation */}
        <motion.div variants={enterCell} className="p-5 xl:p-7">
          <p className="eyebrow text-stone-500">In rotation</p>
          <p className="num mt-4 text-[44px] font-bold leading-[0.9] tracking-[-0.02em] text-stone-900 xl:text-[56px]">
            {totalItems}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            item{totalItems === 1 ? "" : "s"} tracked
          </p>
          {topCategories.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-warm-100 pt-3">
              {topCategories.map(([name, count]) => (
                <li
                  key={name}
                  className="flex items-baseline justify-between gap-3 text-[13px] text-stone-600"
                >
                  <span className="truncate">{name}</span>
                  <span className="num shrink-0 font-semibold text-stone-900">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Use rate */}
        <motion.div variants={enterCell} className="p-5 xl:p-7">
          <p className="eyebrow text-stone-500">Use rate</p>
          <div className="mt-4 flex items-baseline gap-1">
            <p className="num text-[44px] font-bold leading-[0.9] tracking-[-0.02em] text-stone-900 xl:text-[56px]">
              {useRate}
            </p>
            <span className="text-2xl font-semibold text-stone-400">%</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">tracked history</p>
          <div className="mt-4 border-t border-warm-100 pt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-warm-50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, useRate))}%` }}
                transition={{
                  duration: 1.1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.4,
                }}
                className="h-full rounded-full bg-sage-500"
              />
            </div>
            <p className="mt-2.5 text-[13px] font-medium text-sage-700">
              {useQualifier}
            </p>
          </div>
        </motion.div>

        {/* Expiring soon */}
        <motion.div variants={enterCell} className="p-5 xl:p-7">
          <p className="eyebrow text-stone-500">Expiring soon</p>
          <p
            className={`num mt-4 text-[44px] font-bold leading-[0.9] tracking-[-0.02em] xl:text-[56px] ${expiringTone}`}
          >
            {expiringCount}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            within the next 5 days
          </p>
          <div className="mt-4 border-t border-warm-100 pt-3">
            <p
              className={`text-[13px] font-medium ${
                expiringCount === 0 ? "text-sage-700" : expiringCount <= 2 ? "text-amber-700" : "text-terracotta-600"
              }`}
            >
              {expiringQualifier}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Jump to the pantry list below to act.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
