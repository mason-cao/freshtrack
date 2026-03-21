export type FreshnessStatus = "fresh" | "warning" | "urgent" | "expired";

export function getFreshnessStatus(expirationDate: string): FreshnessStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate + "T00:00:00");
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 2) return "urgent";
  if (diffDays <= 5) return "warning";
  return "fresh";
}

export function getDaysUntilExpiry(expirationDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate + "T00:00:00");
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getExpiryLabel(expirationDate: string): string {
  const days = getDaysUntilExpiry(expirationDate);
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
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        badge: "bg-emerald-100 text-emerald-800",
        dot: "bg-emerald-500",
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
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        badge: "bg-red-100 text-red-800",
        dot: "bg-red-500",
      };
    case "expired":
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-500",
        badge: "bg-gray-100 text-gray-600",
        dot: "bg-gray-400",
      };
  }
}
