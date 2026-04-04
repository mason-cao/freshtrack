"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getFreshnessStatus, freshnessColor, getExpiryLabel } from "@/lib/freshness";
import { getFoodImage } from "@/lib/food-images";
import { Badge } from "@/components/ui/badge";
import { ItemActions } from "@/components/pantry/item-actions";

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
  onAction: () => void;
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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
          Needs Attention
        </h2>
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
              className="flex items-center justify-between rounded-xl bg-warm-white px-4 py-3 shadow-warm-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full shrink-0 overflow-hidden bg-warm-50">
                  <Image
                    src={imageUrl}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-stone-900 truncate block">
                    {item.name}
                  </span>
                  <span className="text-xs text-stone-400">
                    {item.quantity} {item.unit}
                    {item.categoryName && ` · ${item.categoryName}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <Badge className={`${colors.badge} text-[10px]`}>
                  {getExpiryLabel(item.expirationDate)}
                </Badge>
                <ItemActions itemId={item.id} itemName={item.name} onAction={onAction} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
