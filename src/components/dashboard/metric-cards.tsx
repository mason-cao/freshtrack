"use client";

import { motion } from "framer-motion";
import { Package, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const metrics = [
    {
      label: "Active items",
      value: activeItems,
      helper: "In rotation",
      icon: Package,
      accent: "bg-sage-500",
      iconColor: "text-sage-600",
      softBg: "bg-sage-50",
      surface: "from-sage-50/80 via-warm-white to-warm-white",
    },
    {
      label: "Use rate",
      value: `${useRate}%`,
      helper: "Tracked history",
      icon: TrendingUp,
      accent: "bg-amber-500",
      iconColor: "text-amber-700",
      softBg: "bg-amber-50",
      surface: "from-amber-50/80 via-warm-white to-warm-white",
    },
    {
      label: "Expiring soon",
      value: expiringSoon,
      helper: expiringSoon > 0 ? "Needs action" : "Clear",
      icon: Clock,
      accent: expiringSoon > 0 ? "bg-terracotta-500" : "bg-sage-500",
      iconColor: expiringSoon > 0 ? "text-terracotta-600" : "text-sage-600",
      softBg: expiringSoon > 0 ? "bg-terracotta-50" : "bg-sage-50",
      surface:
        expiringSoon > 0
          ? "from-terracotta-50/80 via-warm-white to-warm-white"
          : "from-sage-50/80 via-warm-white to-warm-white",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-3"
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <motion.div
            key={metric.label}
            variants={item}
            className={cn(
              "relative overflow-hidden rounded-xl border border-warm-100 bg-gradient-to-br p-3 shadow-warm-sm transition-shadow duration-200 hover:shadow-warm xl:p-5",
              metric.surface
            )}
          >
            <div className={cn("absolute inset-x-0 top-0 h-1", metric.accent)} />
            <div className={cn("mb-3 inline-flex rounded-lg p-2", metric.softBg)}>
              <Icon className={cn("h-4 w-4 xl:h-5 xl:w-5", metric.iconColor)} />
            </div>
            <p className="text-2xl font-bold leading-none text-stone-900 xl:text-3xl">
              {metric.value}
            </p>
            <p className="mt-2 text-xs font-medium text-stone-600">{metric.label}</p>
            <p className="mt-0.5 hidden text-[11px] text-stone-400 sm:block">
              {metric.helper}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
