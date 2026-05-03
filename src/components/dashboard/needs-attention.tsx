"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getFreshnessStatus, freshnessColor, getExpiryLabel } from "@/lib/freshness";
import { getFoodImage } from "@/lib/food-images";
import { Badge } from "@/components/ui/badge";
import { ItemActions } from "@/components/pantry/item-actions";
import { FreshnessMeter } from "@/components/pantry/freshness-meter";
import type { PantryActionOutcome } from "@/lib/pantry-events";

interface Item {
  id: number;
  name: string;
  categoryIcon: string | null;
  categoryName: string | null;
  quantity: number;
  unit: string;
  expirationDate: string;
}

interface NeedsAttentionProps {
  items: Item[];
  onAction: (outcome?: PantryActionOutcome) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

export function NeedsAttention({ items, onAction }: NeedsAttentionProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">Needs attention</h2>
          <p className="text-xs text-stone-400">
            {items.length} item{items.length !== 1 ? "s" : ""} expiring soon
          </p>
        </div>
        <Link
          href="/pantry"
          className="text-sm text-sage-600 hover:text-sage-700 flex items-center gap-1 font-medium"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {items.slice(0, 6).map((item) => {
          const status = getFreshnessStatus(item.expirationDate);
          const colors = freshnessColor(status);
          const imageUrl = getFoodImage(item.name, item.categoryName);

          return (
            <motion.div
              key={item.id}
              variants={itemVariant}
              className={`relative overflow-hidden rounded-xl border bg-warm-white px-4 py-3 shadow-warm-sm transition-shadow duration-200 hover:shadow-warm ${colors.border}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className={`h-11 w-11 rounded-lg shrink-0 overflow-hidden border-2 bg-warm-50 ${colors.border}`}>
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-stone-900 truncate block">
                      {item.name}
                    </span>
                    <span className="text-xs text-stone-400">
                      {item.quantity} {item.unit}
                      {item.categoryName && ` · ${item.categoryName}`}
                    </span>
                    <FreshnessMeter
                      expirationDate={item.expirationDate}
                      compact
                      className="mt-2 max-w-[180px]"
                    />
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                  <Badge className={`${colors.badge} max-w-[118px] text-center text-[10px] leading-tight`}>
                    {getExpiryLabel(item.expirationDate)}
                  </Badge>
                  <ItemActions itemId={item.id} itemName={item.name} onAction={onAction} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
