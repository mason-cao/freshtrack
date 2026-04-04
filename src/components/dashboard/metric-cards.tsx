"use client";

import { motion } from "framer-motion";
import { Package, TrendingUp, Clock } from "lucide-react";

interface MetricCardsProps {
  activeItems: number;
  useRate: number;
  expiringSoon: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

export function MetricCards({ activeItems, useRate, expiringSoon }: MetricCardsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-3"
    >
      <motion.div variants={item} className="rounded-xl bg-warm-white p-4 shadow-warm">
        <Package className="h-5 w-5 text-sage-500 mb-2" />
        <p className="text-2xl font-bold text-stone-900">{activeItems}</p>
        <p className="text-xs text-stone-500 mt-0.5">Active Items</p>
      </motion.div>

      <motion.div variants={item} className="rounded-xl bg-warm-white p-4 shadow-warm">
        <TrendingUp className="h-5 w-5 text-sage-500 mb-2" />
        <p className="text-2xl font-bold text-stone-900">{useRate}%</p>
        <p className="text-xs text-stone-500 mt-0.5">Use Rate</p>
      </motion.div>

      <motion.div variants={item} className="rounded-xl bg-warm-white p-4 shadow-warm">
        <Clock className={`h-5 w-5 mb-2 ${expiringSoon > 0 ? "text-amber-500" : "text-sage-500"}`} />
        <p className={`text-2xl font-bold ${expiringSoon > 0 ? "text-amber-600" : "text-stone-900"}`}>
          {expiringSoon}
        </p>
        <p className="text-xs text-stone-500 mt-0.5">Expiring Soon</p>
      </motion.div>
    </motion.div>
  );
}
