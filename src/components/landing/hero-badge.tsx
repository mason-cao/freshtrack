"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Apple, Check, TrendingDown } from "lucide-react";

const states = [
  {
    id: "see",
    Icon: Apple,
    iconBg: "bg-amber-50 text-amber-700",
    eyebrow: "Use today",
    title: "Spinach, Greek yogurt",
    detail: "Recipe ready: 25 minutes, four servings.",
  },
  {
    id: "cook",
    Icon: Check,
    iconBg: "bg-sage-50 text-sage-700",
    eyebrow: "Used tonight",
    title: "Yogurt, spinach, salmon",
    detail: "$24 added to this month’s savings.",
  },
  {
    id: "save",
    Icon: TrendingDown,
    iconBg: "bg-sage-500 text-warm-white",
    eyebrow: "Saved this month",
    title: "$142, waste rate down 63%",
    detail: "Quietly compounding, week by week.",
  },
];

const INTERVAL_MS = 4200;

export function HeroBadge() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % states.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const current = states[index];
  const Icon = current.Icon;

  return (
    <div className="absolute -bottom-6 -left-4 w-[min(280px,80%)] rounded-2xl bg-warm-white p-4 shadow-warm-lg ring-1 ring-warm-100 sm:-left-6">
      <div className="flex items-start gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={`icon-${current.id}`}
            initial={reduceMotion ? false : { scale: 0.6, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.iconBg}`}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${current.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow text-stone-500">{current.eyebrow}</p>
              <p className="mt-1 text-sm font-semibold text-stone-900">{current.title}</p>
              <p className="mt-0.5 text-xs text-stone-500">{current.detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div
        className="mt-3 flex items-center gap-1.5"
        aria-hidden
      >
        {states.map((s, i) => (
          <span
            key={s.id}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-sage-500" : "w-2 bg-warm-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
