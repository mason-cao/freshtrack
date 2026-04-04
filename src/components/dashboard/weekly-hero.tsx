"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Leaf } from "lucide-react";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sage-500 via-sage-600 to-sage-700 p-6 xl:p-8 text-white shadow-warm-lg"
    >
      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute right-12 bottom-4 h-16 w-16 rounded-full bg-white/5 hidden xl:block" />

      {/* Tagline row */}
      <div className="relative z-10 flex items-center gap-2 mb-2">
        <Leaf className="h-4 w-4 text-sage-200" />
        <p className="text-sm font-medium text-sage-100">
          Weekly Impact
        </p>
      </div>
      <p className="relative z-10 text-lg xl:text-xl font-semibold text-white/90 mb-5">
        You&apos;re saving more than just food.
      </p>

      <div className="relative z-10 grid grid-cols-3 gap-4 xl:gap-8">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-4 w-4 xl:h-5 xl:w-5 text-sage-200" />
            <span className="text-3xl xl:text-4xl font-bold">
              <AnimatedNumber value={used} />
            </span>
          </div>
          <p className="text-xs xl:text-sm text-sage-200">Items Used</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="h-4 w-4 xl:h-5 xl:w-5 text-terracotta-50" />
            <span className="text-3xl xl:text-4xl font-bold text-white/90">
              <AnimatedNumber value={wasted} />
            </span>
          </div>
          <p className="text-xs xl:text-sm text-sage-200">Items Wasted</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="h-4 w-4 xl:h-5 xl:w-5 text-amber-300" />
            <span className="text-3xl xl:text-4xl font-bold text-amber-200">
              <AnimatedNumber value={saved} prefix="$" />
            </span>
          </div>
          <p className="text-xs xl:text-sm text-sage-200">Money Saved</p>
        </div>
      </div>
    </motion.div>
  );
}
