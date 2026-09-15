"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, animate } from "framer-motion";

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(
    count,
    (v) => `${prefix}${Math.round(v)}${suffix}`,
  );

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [count, reduceMotion, value]);

  return <motion.span>{rounded}</motion.span>;
}

export function WasteRateRing({ rate }: { rate: number }) {
  const circumference = 2 * Math.PI * 42;
  const fillPercent = Math.min(rate, 100);
  const offset = circumference - (fillPercent / 100) * circumference;
  const isHigh = rate > 25;
  const ringColor = isHigh ? "#c2410c" : "#527a52";
  const centerColor = isHigh ? "text-terracotta-600" : "text-sage-600";

  return (
    <div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44 xl:h-48 xl:w-48">
      <svg aria-hidden="true" focusable="false" className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#f3ead8"
          strokeWidth="6"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={ringColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`num text-[42px] font-bold leading-none tracking-[-0.02em] xl:text-5xl ${centerColor}`}
        >
          <AnimatedNumber value={rate} suffix="%" />
        </span>
        <span className="eyebrow mt-1.5 text-stone-500">Waste rate</span>
      </div>
    </div>
  );
}
