"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";
import { TrendingUp, TrendingDown, DollarSign, Leaf, Percent } from "lucide-react";
import { getFoodImage } from "@/lib/food-images";

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
      className="relative overflow-hidden rounded-2xl bg-sage-800 px-5 py-6 text-white shadow-warm-lg sm:px-6 xl:p-8"
    >
      <div className="absolute inset-0">
        <Image
          src={getFoodImage("seasonal produce", "Produce")}
          alt=""
          fill
          priority
          className="object-cover opacity-30"
          sizes="(min-width: 1280px) 70vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sage-900 via-sage-800/95 to-sage-700/75" />
      </div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-sage-50 backdrop-blur-sm">
            <Leaf className="h-4 w-4 text-sage-200" />
            Weekly impact
          </div>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-bold leading-none xl:text-6xl">
              <AnimatedNumber value={useRate} />
            </span>
            <div className="pb-1">
              <div className="flex items-center gap-1 text-sage-100">
                <Percent className="h-4 w-4" />
                <span className="text-sm font-semibold">use rate</span>
              </div>
              <p className="mt-1 text-sm text-sage-100/85">
                You&apos;re saving more than just food.
              </p>
            </div>
          </div>
          <div className="mt-5 max-w-xl">
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${useRate}%` }}
                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full rounded-full bg-amber-300"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs font-medium text-sage-100/80">
              <span>{used} used</span>
              <span>{wasted} wasted</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-2">
          <div className="border-l border-white/20 pl-3 lg:flex lg:items-center lg:justify-between lg:border-l-0 lg:border-t lg:pl-0 lg:pt-3">
            <div className="flex items-center gap-1.5 text-sage-100">
              <TrendingUp className="h-4 w-4 text-sage-200" />
              <span className="text-xs font-medium">Used</span>
            </div>
            <span className="mt-1 block text-2xl font-bold lg:mt-0 xl:text-3xl">
              <AnimatedNumber value={used} />
            </span>
          </div>

          <div className="border-l border-white/20 pl-3 lg:flex lg:items-center lg:justify-between lg:border-l-0 lg:border-t lg:pl-0 lg:pt-3">
            <div className="flex items-center gap-1.5 text-sage-100">
              <TrendingDown className="h-4 w-4 text-terracotta-50" />
              <span className="text-xs font-medium">Wasted</span>
            </div>
            <span className="mt-1 block text-2xl font-bold text-white/90 lg:mt-0 xl:text-3xl">
              <AnimatedNumber value={wasted} />
            </span>
          </div>

          <div className="border-l border-white/20 pl-3 lg:flex lg:items-center lg:justify-between lg:border-l-0 lg:border-t lg:pl-0 lg:pt-3">
            <div className="flex items-center gap-1.5 text-sage-100">
              <DollarSign className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-medium">Saved</span>
            </div>
            <span className="mt-1 block text-2xl font-bold text-amber-200 lg:mt-0 xl:text-3xl">
              <AnimatedNumber value={saved} prefix="$" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
