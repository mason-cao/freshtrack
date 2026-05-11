"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  type FreshnessStatus,
  getFreshnessScore,
  getFreshnessStatus,
} from "@/lib/freshness";

interface FreshnessMeterProps {
  expirationDate: string;
  compact?: boolean;
  className?: string;
}

const labels: Record<FreshnessStatus, string> = {
  fresh: "Fresh",
  warning: "Use soon",
  urgent: "Urgent",
  expired: "Expired",
};

const segmentOrder: FreshnessStatus[] = [
  "fresh",
  "warning",
  "urgent",
  "expired",
];

const segmentFill: Record<FreshnessStatus, string> = {
  fresh: "bg-sage-500",
  warning: "bg-amber-500",
  urgent: "bg-terracotta-500",
  expired: "bg-stone-400",
};

const statusText: Record<FreshnessStatus, string> = {
  fresh: "text-sage-700",
  warning: "text-amber-700",
  urgent: "text-terracotta-600",
  expired: "text-stone-500",
};

export function FreshnessMeter({
  expirationDate,
  compact = false,
  className,
}: FreshnessMeterProps) {
  const status = getFreshnessStatus(expirationDate);
  const score = getFreshnessScore(expirationDate);

  return (
    <div
      className={cn("min-w-0", className)}
      aria-hidden={compact ? "true" : undefined}
      role={compact ? undefined : "img"}
      aria-label={compact ? undefined : `Freshness status: ${labels[status]}`}
    >
      <div className="flex h-2 items-stretch gap-[3px]">
        {segmentOrder.map((seg) => {
          const isActive = seg === status;
          return (
            <div
              key={seg}
              className="relative h-full flex-1 overflow-hidden rounded-full bg-warm-50"
            >
              {isActive && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ transformOrigin: "left center" }}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    segmentFill[seg],
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {!compact && (
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.1em]",
              statusText[status],
            )}
          >
            {labels[status]}
          </span>
          <span className="num text-[10px] font-medium text-stone-400">
            {score}%
          </span>
        </div>
      )}
    </div>
  );
}
