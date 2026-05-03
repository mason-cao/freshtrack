"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { CheckCircle, Trash2 } from "lucide-react";
import { getFreshnessStatus, freshnessColor, getExpiryLabel } from "@/lib/freshness";
import { getFoodImage } from "@/lib/food-images";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import confetti from "canvas-confetti";
import { fetchJson } from "@/lib/api-client";
import { FreshnessMeter } from "./freshness-meter";

interface ItemCardProps {
  item: {
    id: number;
    name: string;
    categoryName: string | null;
    categoryIcon?: string | null;
    quantity: number;
    unit: string;
    expirationDate: string;
  };
  onAction: () => void;
}

export function ItemCard({ item, onAction }: ItemCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState<"consume" | "waste" | null>(null);
  const x = useMotionValue(0);
  const usedOpacity = useTransform(x, [0, 80], [0, 1]);
  const wastedOpacity = useTransform(x, [-80, 0], [1, 0]);
  const usedScale = useTransform(x, [0, 80], [0.5, 1]);
  const wastedScale = useTransform(x, [-80, 0], [1, 0.5]);
  const [error, setError] = useState<string | null>(null);

  const status = getFreshnessStatus(item.expirationDate);
  const colors = freshnessColor(status);
  const imageUrl = getFoodImage(item.name, item.categoryName);

  async function handleOutcome(action: "consume" | "waste") {
    if (saving) return;

    setSaving(action);
    setError(null);
    try {
      await fetchJson(`/api/items/${item.id}/${action}`, { method: "POST" });
      setDismissed(true);
      if (action === "consume") {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { x: 0.7, y: 0.6 },
          colors: ["#527a52", "#b8cdb8", "#d97706"],
        });
      }
      onAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update item.");
    } finally {
      setSaving(null);
    }
  }

  async function handleSwipeEnd(_: unknown, info: { offset: { x: number } }) {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await handleOutcome("consume");
    } else if (info.offset.x < -threshold) {
      await handleOutcome("waste");
    }
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 200, transition: { duration: 0.3 } }}
          className="relative overflow-hidden rounded-xl"
        >
          {/* Swipe backgrounds */}
          <div className="absolute inset-0 flex items-center justify-between px-6">
            <motion.div
              style={{ opacity: wastedOpacity, scale: wastedScale }}
              className="flex items-center gap-2 text-terracotta-500"
            >
              <Trash2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Wasted</span>
            </motion.div>
            <motion.div
              style={{ opacity: usedOpacity, scale: usedScale }}
              className="flex items-center gap-2 text-sage-600"
            >
              <span className="text-sm font-semibold">Used</span>
              <CheckCircle className="h-5 w-5" />
            </motion.div>
          </div>

          {/* Card content */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            style={{ x }}
            onDragEnd={handleSwipeEnd}
            className={`relative overflow-hidden rounded-xl border bg-warm-white px-4 py-3 shadow-warm-sm cursor-grab active:cursor-grabbing ${colors.border}`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-lg shrink-0 overflow-hidden border-2 bg-warm-50 ${colors.border}`}>
                <Image src={imageUrl} alt={item.name} width={44} height={44} className="h-full w-full object-cover" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <p className="font-medium text-stone-900 truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-stone-400">
                    {item.quantity} {item.unit}
                  </span>
                  {item.categoryName && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {item.categoryName}
                    </Badge>
                  )}
                </div>
                <FreshnessMeter expirationDate={item.expirationDate} compact className="mt-2 max-w-[160px]" />
              </div>

              <Badge className={`${colors.badge} max-w-[112px] shrink-0 text-center text-[10px] leading-tight`}>
                {getExpiryLabel(item.expirationDate)}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOutcome("consume")}
                disabled={!!saving}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-sage-200 bg-sage-50 text-xs font-semibold text-sage-700 transition-colors duration-200 hover:bg-sage-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {saving === "consume" ? "Saving" : "Used"}
              </button>
              <button
                type="button"
                onClick={() => handleOutcome("waste")}
                disabled={!!saving}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-terracotta-100 bg-terracotta-50 text-xs font-semibold text-terracotta-600 transition-colors duration-200 hover:bg-terracotta-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {saving === "waste" ? "Saving" : "Wasted"}
              </button>
            </div>
          </motion.div>
          {error && (
            <p className="mt-1 px-2 text-xs text-terracotta-600">{error}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
