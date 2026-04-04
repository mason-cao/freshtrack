"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

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
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sage-500 via-sage-600 to-sage-700 p-6 text-white shadow-warm-lg"
    >
      {/* Subtle decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />

      <p className="text-sm font-medium text-sage-100 mb-4 relative z-10">
        Weekly Impact
      </p>

      <div className="relative z-10 grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-4 w-4 text-sage-200" />
            <span className="text-3xl font-bold">
              <AnimatedNumber value={used} />
            </span>
          </div>
          <p className="text-xs text-sage-200">Used</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="h-4 w-4 text-terracotta-50" />
            <span className="text-3xl font-bold text-white/90">
              <AnimatedNumber value={wasted} />
            </span>
          </div>
          <p className="text-xs text-sage-200">Wasted</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="h-4 w-4 text-amber-300" />
            <span className="text-3xl font-bold text-amber-200">
              <AnimatedNumber value={saved} prefix="$" />
            </span>
          </div>
          <p className="text-xs text-sage-200">Saved</p>
        </div>
      </div>
    </motion.div>
  );
}
