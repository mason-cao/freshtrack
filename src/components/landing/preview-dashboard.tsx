"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChefHat, Clock3, Sparkles } from "lucide-react";
import { getFoodImage } from "@/lib/food-images";

interface DemoItem {
  id: string;
  name: string;
  detail: string;
  image: string;
  daysLabel: string;
  tone: "urgent" | "soon";
  savedValue: number;
}

const ITEMS: DemoItem[] = [
  {
    id: "yogurt",
    name: "Greek yogurt",
    detail: "1 container · Dairy",
    image: getFoodImage("greek yogurt", "Dairy"),
    daysLabel: "Use today",
    tone: "urgent",
    savedValue: 6,
  },
  {
    id: "spinach",
    name: "Spinach",
    detail: "1 bag · Produce",
    image: getFoodImage("spinach", "Produce"),
    daysLabel: "2 days left",
    tone: "soon",
    savedValue: 4,
  },
  {
    id: "salmon",
    name: "Salmon fillet",
    detail: "12 oz · Seafood",
    image: getFoodImage("salmon", "Seafood"),
    daysLabel: "3 days left",
    tone: "soon",
    savedValue: 14,
  },
];

const toneClasses = {
  urgent: "bg-terracotta-50 text-terracotta-700 ring-1 ring-terracotta-100",
  soon: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
} satisfies Record<"urgent" | "soon", string>;

const BASELINE_SAVED = 142;

export function PreviewDashboard() {
  const reduceMotion = useReducedMotion();
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const remaining = ITEMS.filter((item) => !usedIds.includes(item.id));
  const savedThisDemo = ITEMS.filter((item) => usedIds.includes(item.id)).reduce(
    (sum, item) => sum + item.savedValue,
    0,
  );
  const totalSaved = BASELINE_SAVED + savedThisDemo;
  const allUsed = remaining.length === 0;

  useEffect(() => {
    if (!allUsed) return;
    const timeout = window.setTimeout(() => {
      setUsedIds([]);
      setHasInteracted(false);
    }, 2400);
    return () => window.clearTimeout(timeout);
  }, [allUsed]);

  function handleMarkUsed(item: DemoItem) {
    if (usedIds.includes(item.id)) return;
    setUsedIds((prev) => [...prev, item.id]);
    setHasInteracted(true);

    if (reduceMotion) return;

    const node = cardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height / 3) / window.innerHeight;

    void import("canvas-confetti")
      .then(({ default: confetti }) =>
        confetti({
          particleCount: 56,
          spread: 64,
          startVelocity: 32,
          gravity: 0.9,
          decay: 0.92,
          ticks: 160,
          scalar: 0.85,
          origin: { x: originX, y: Math.max(originY, 0.18) },
          colors: ["#527a52", "#8fb08f", "#d97706", "#fcd34d", "#fbf5e6"],
          disableForReducedMotion: true,
        })
      )
      .catch(() => undefined);
  }

  return (
    <div
      ref={cardRef}
      className="relative rounded-3xl bg-warm-white p-5 shadow-warm-lg ring-1 ring-warm-100 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-sage-700">Sunday afternoon</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-stone-900">
            {allUsed
              ? "Pantry caught up. Resetting..."
              : remaining.length === ITEMS.length
                ? "Three items want your attention"
                : `${remaining.length} item${remaining.length === 1 ? "" : "s"} left to use`}
          </p>
        </div>
        <motion.span
          key={totalSaved}
          initial={reduceMotion ? false : { scale: 0.85, y: -4 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-700 ring-1 ring-sage-100"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="num tabular-nums">${totalSaved}</span>
          <span className="text-sage-600/80 font-normal">saved</span>
        </motion.span>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-warm-100 bg-cream/40">
        <AnimatePresence initial={false} mode="popLayout">
          {remaining.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: 40, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } }
              }
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-center gap-3 p-3 ${
                index !== 0 ? "border-t border-warm-100" : ""
              }`}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-warm-50 ring-1 ring-warm-100">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900">{item.name}</p>
                <p className="truncate text-xs text-stone-500">{item.detail}</p>
              </div>
              <span
                className={`hidden items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${toneClasses[item.tone]}`}
              >
                <Clock3 className="h-3 w-3" />
                {item.daysLabel}
              </span>
              <button
                type="button"
                onClick={() => handleMarkUsed(item)}
                className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-sage-500 px-3 text-xs font-semibold text-warm-white shadow-warm-sm transition-all duration-200 hover:bg-sage-600 hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white cursor-pointer"
                aria-label={`Mark ${item.name} used and add $${item.savedValue} to savings`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Used</span>
                <span className="sr-only">${item.savedValue} saved</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {allUsed && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 p-5 text-sm text-stone-600"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sage-500 text-warm-white">
              <ChefHat className="h-4 w-4" />
            </span>
            <p>
              Nicely done. That&apos;s another <strong>${savedThisDemo}</strong> you
              didn&apos;t throw away.
            </p>
          </motion.div>
        )}
      </div>

      <p className="mt-4 flex items-center justify-between gap-3 text-xs text-stone-500">
        <span>
          {hasInteracted
            ? "Each tap is what marking an item used feels like."
            : "Tap an item — this works."}
        </span>
        <span className="hidden text-stone-400 sm:inline">Live demo</span>
      </p>
    </div>
  );
}
