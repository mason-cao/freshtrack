import { differenceInCalendarDays } from "@/lib/dates";

export type FreshnessStatus = "fresh" | "warning" | "urgent" | "expired";

export function getFreshnessStatus(expirationDate: string): FreshnessStatus {
  const diffDays = getDaysUntilExpiry(expirationDate);

  if (Number.isNaN(diffDays)) return "expired";
  if (diffDays < 0) return "expired";
  if (diffDays <= 2) return "urgent";
  if (diffDays <= 5) return "warning";
  return "fresh";
}

export function getDaysUntilExpiry(expirationDate: string): number {
  return differenceInCalendarDays(expirationDate);
}

export function getExpiryLabel(expirationDate: string): string {
  const days = getDaysUntilExpiry(expirationDate);
  if (Number.isNaN(days)) return "Invalid date";
  if (days < -1) return `Expired ${Math.abs(days)} days ago`;
  if (days === -1) return "Expired yesterday";
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `Expires in ${days} days`;
}

export function freshnessColor(status: FreshnessStatus) {
  switch (status) {
    case "fresh":
      return {
        bg: "bg-sage-50",
        border: "border-sage-200",
        text: "text-sage-600",
        badge: "bg-sage-100 text-sage-700",
        dot: "bg-sage-500",
      };
    case "warning":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        badge: "bg-amber-100 text-amber-800",
        dot: "bg-amber-500",
      };
    case "urgent":
      return {
        bg: "bg-terracotta-50",
        border: "border-terracotta-100",
        text: "text-terracotta-600",
        badge: "bg-terracotta-50 text-terracotta-600",
        dot: "bg-terracotta-500",
      };
    case "expired":
      return {
        bg: "bg-warm-50",
        border: "border-warm-200",
        text: "text-stone-500",
        badge: "bg-warm-50 text-stone-500",
        dot: "bg-stone-400",
      };
  }
}
