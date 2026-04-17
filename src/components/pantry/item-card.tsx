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
  const x = useMotionValue(0);
  const usedOpacity = useTransform(x, [0, 80], [0, 1]);
  const wastedOpacity = useTransform(x, [-80, 0], [1, 0]);
  const usedScale = useTransform(x, [0, 80], [0.5, 1]);
  const wastedScale = useTransform(x, [-80, 0], [1, 0.5]);
  const [error, setError] = useState<string | null>(null);

  const status = getFreshnessStatus(item.expirationDate);
  const colors = freshnessColor(status);
  const imageUrl = getFoodImage(item.name, item.categoryName);

  async function handleSwipeEnd(_: unknown, info: { offset: { x: number } }) {
    const threshold = 100;
    if (info.offset.x > threshold) {
      // Swipe right = Used
      setError(null);
      try {
        await fetchJson(`/api/items/${item.id}/consume`, { method: "POST" });
        setDismissed(true);
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { x: 0.7, y: 0.6 },
          colors: ["#527a52", "#b8cdb8", "#d97706"],
        });
        onAction();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update item.");
      }
    } else if (info.offset.x < -threshold) {
      // Swipe left = Wasted
      setError(null);
      try {
        await fetchJson(`/api/items/${item.id}/waste`, { method: "POST" });
        setDismissed(true);
        onAction();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update item.");
      }
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
            className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-warm-100 bg-warm-white px-4 py-3 shadow-warm-sm cursor-grab active:cursor-grabbing"
          >
            <div className={`absolute inset-y-0 left-0 w-1 ${colors.dot}`} />
            <div className="h-11 w-11 rounded-lg shrink-0 overflow-hidden bg-warm-50">
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
          </motion.div>
          {error && (
            <p className="mt-1 px-2 text-xs text-terracotta-600">{error}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
