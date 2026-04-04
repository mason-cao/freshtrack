"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { CheckCircle, Trash2 } from "lucide-react";
import { getFreshnessStatus, freshnessColor, getExpiryLabel } from "@/lib/freshness";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

interface ItemCardProps {
  item: {
    id: number;
    name: string;
    categoryName: string | null;
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

  const status = getFreshnessStatus(item.expirationDate);
  const colors = freshnessColor(status);

  async function handleSwipeEnd(_: unknown, info: { offset: { x: number } }) {
    const threshold = 100;
    if (info.offset.x > threshold) {
      // Swipe right = Used
      setDismissed(true);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { x: 0.7, y: 0.6 },
        colors: ["#527a52", "#b8cdb8", "#d97706"],
      });
      await fetch(`/api/items/${item.id}/consume`, { method: "POST" });
      onAction();
    } else if (info.offset.x < -threshold) {
      // Swipe left = Wasted
      setDismissed(true);
      await fetch(`/api/items/${item.id}/waste`, { method: "POST" });
      onAction();
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
            className="relative flex items-center gap-3 rounded-xl bg-warm-white px-4 py-3 shadow-warm-sm cursor-grab active:cursor-grabbing"
          >
            <div className={`h-10 w-1 rounded-full shrink-0 ${colors.dot}`} />

            <div className="flex-1 min-w-0">
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
            </div>

            <Badge className={`${colors.badge} text-[10px] shrink-0`}>
              {getExpiryLabel(item.expirationDate)}
            </Badge>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
