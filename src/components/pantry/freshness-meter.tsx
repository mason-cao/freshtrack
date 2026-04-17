"use client";

import { cn } from "@/lib/utils";
import {
  freshnessColor,
  getFreshnessScore,
  getFreshnessStatus,
} from "@/lib/freshness";

interface FreshnessMeterProps {
  expirationDate: string;
  compact?: boolean;
  className?: string;
}

const labels = {
  fresh: "Fresh",
  warning: "Use soon",
  urgent: "Urgent",
  expired: "Expired",
};

export function FreshnessMeter({
  expirationDate,
  compact = false,
  className,
}: FreshnessMeterProps) {
  const status = getFreshnessStatus(expirationDate);
  const score = getFreshnessScore(expirationDate);
  const colors = freshnessColor(status);

  return (
    <div className={cn("min-w-0", className)}>
      <div className="h-1.5 overflow-hidden rounded-full bg-warm-100">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors.dot)}
          style={{ width: `${score}%` }}
        />
      </div>
      {!compact && (
        <div className="mt-1 flex items-center justify-between gap-2 text-[10px] font-medium text-stone-400">
          <span>{labels[status]}</span>
          <span>{score}%</span>
        </div>
      )}
    </div>
  );
}
