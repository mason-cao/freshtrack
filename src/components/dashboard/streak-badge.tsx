"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  /** Total items marked used (rescued from waste). */
  usedCount: number;
}

export function StreakBadge({ usedCount }: StreakBadgeProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, usedCount, {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    return controls.stop;
  }, [count, usedCount]);

  if (usedCount <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
      className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1"
    >
      <Flame className="h-3.5 w-3.5 text-amber-500" />
      <span className="text-xs font-semibold text-sage-700">
        <motion.span>{rounded}</motion.span>&nbsp;saved from waste
      </span>
    </motion.div>
  );
}
