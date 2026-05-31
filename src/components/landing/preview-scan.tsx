"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ScanLine, Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Deterministic "barcode" bar widths — looks like a real EAN-13 without
// re-randomising every render (which would jitter on the loop).
const BAR_WIDTHS = [
  2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 1, 3, 1, 2, 1, 3, 2, 1, 1, 2,
];

type Phase = "scanning" | "found";

// Mirrors the real add-item prefill: name + category + a suggested freshness
// window the user can adjust before saving.
const PREFILL = {
  barcode: "0 1234 56789 0",
  name: "Organic Baby Spinach",
  category: "Produce",
  freshness: "5 days",
};

export function PreviewScan() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("scanning");

  // Self-driving state machine: scan for a beat, resolve to the prefill, repeat.
  // Reduced motion holds on the resolved result with no animation.
  useEffect(() => {
    if (reduceMotion) {
      setPhase("found");
      return;
    }
    const duration = phase === "scanning" ? 2600 : 3200;
    const next: Phase = phase === "scanning" ? "found" : "scanning";
    const id = window.setTimeout(() => setPhase(next), duration);
    return () => window.clearTimeout(id);
  }, [phase, reduceMotion]);

  return (
    <div className="rounded-3xl bg-warm-white p-5 shadow-warm-lg ring-1 ring-warm-100 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-sage-700">Unpacking groceries</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-stone-900">
            {phase === "found" ? "Prefilled in two taps" : "Point the camera at a barcode"}
          </p>
        </div>
        <span className="hidden text-xs text-stone-400 sm:inline">Live demo</span>
      </div>

      <div className="relative mt-5 h-56 overflow-hidden rounded-2xl bg-stone-900 sm:h-60">
        <AnimatePresence mode="wait">
          {phase === "scanning" ? (
            <motion.div
              key="scanning"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6"
            >
              {/* Framing reticle, matching the real scanner overlay */}
              <div className="relative flex h-32 w-full max-w-xs items-center justify-center rounded-xl border-2 border-white/70">
                <div className="flex h-14 items-end gap-[3px]" aria-hidden>
                  {BAR_WIDTHS.map((w, i) => (
                    <span
                      key={i}
                      className="h-full rounded-[1px] bg-white/90"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                {!reduceMotion && (
                  <motion.div
                    className="absolute inset-x-3 h-0.5 rounded-full bg-sage-400 shadow-[0_0_12px_2px_rgba(125,166,127,0.8)]"
                    initial={{ top: "10%" }}
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>
              <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/90">
                <ScanLine className="h-4 w-4" />
                Hold steady — reading the barcode
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="found"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col justify-center gap-3 px-5 sm:px-6"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-500/90 px-2.5 py-1 text-xs font-semibold text-warm-white">
                  <Check className="h-3.5 w-3.5" />
                  Scanned
                </span>
                <span className="num tabular-nums text-xs tracking-widest text-white/45">
                  {PREFILL.barcode}
                </span>
              </div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
                className="rounded-2xl bg-warm-white p-4 shadow-warm-lg ring-1 ring-warm-100"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
                  Item name
                </p>
                <p className="mt-0.5 text-base font-bold tracking-tight text-stone-900">
                  {PREFILL.name}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700 ring-1 ring-sage-100">
                    {PREFILL.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-100">
                    <Sparkles className="h-3 w-3" />~{PREFILL.freshness} freshness
                  </span>
                </div>
                <p className="mt-3 border-t border-warm-100 pt-2.5 text-xs text-stone-500">
                  Name, category, and a suggested date — adjust anything, then save.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
