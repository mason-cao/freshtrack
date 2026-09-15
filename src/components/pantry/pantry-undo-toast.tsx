"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { fetchJson } from "@/lib/api-client";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { subscribeToPantryActions, type PantryActionOutcome } from "@/lib/pantry-events";

export function PantryUndoToast({ onRestored }: { onRestored: () => void }) {
  const latestOutcome = useRef<PantryActionOutcome | null>(null);
  const [outcome, setOutcome] = useState<PantryActionOutcome | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToPantryActions((nextOutcome) => {
      latestOutcome.current = nextOutcome;
      setOutcome(nextOutcome);
      setRestoring(false);
      setError(null);
    });
  }, []);

  useEffect(() => {
    if (!outcome || restoring) return;
    const timeout = window.setTimeout(() => {
      setOutcome(null);
      setError(null);
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, [outcome, restoring]);

  async function handleUndo() {
    if (!outcome || restoring) return;

    const restoringOutcome = outcome;
    setRestoring(true);
    setError(null);
    try {
      await fetchJson(`/api/items/${outcome.itemId}/restore`, { method: "POST" });
      trackAnalyticsEvent("item_restored");
      setOutcome((current) => current === restoringOutcome ? null : current);
      onRestored();
    } catch (err) {
      if (latestOutcome.current === restoringOutcome) {
        setError(err instanceof Error ? err.message : "Unable to restore item.");
      }
    } finally {
      if (latestOutcome.current === restoringOutcome) setRestoring(false);
    }
  }

  const actionLabel = outcome?.action === "consume" ? "used" : "wasted";

  return (
    <AnimatePresence>
      {outcome && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-20 left-4 right-4 z-50 rounded-xl border border-warm-100 bg-warm-white p-3 shadow-warm-lg md:bottom-6 md:left-auto md:right-6 md:w-[360px]"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-sage-50 p-2 text-sage-600">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-900">
                Marked {outcome.itemName} {actionLabel}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                Undo will restore it to your active pantry.
              </p>
              {error && <p role="alert" className="mt-1 text-xs text-terracotta-600">{error}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={restoring}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-sage-200 bg-sage-50 px-3 text-xs font-semibold text-sage-700 transition-colors duration-200 hover:bg-sage-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {restoring ? "Restoring" : "Undo"}
              </button>
              <button
                type="button"
                onClick={() => setOutcome(null)}
                aria-label="Dismiss pantry update"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors duration-200 hover:bg-warm-50 hover:text-stone-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
