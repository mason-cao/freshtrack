"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Trash2, X } from "lucide-react";
import { fetchJson } from "@/lib/api-client";
import {
  notifyPantryActionCompleted,
  type PantryActionOutcome,
  type PantryCompletionAction,
} from "@/lib/pantry-events";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

interface ItemActionsProps {
  itemId: number;
  itemName: string;
  onAction: (outcome?: PantryActionOutcome) => void;
}

export function ItemActions({ itemId, itemName, onAction }: ItemActionsProps) {
  const [confirming, setConfirming] = useState<"consume" | "waste" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: PantryCompletionAction) {
    setLoading(true);
    setError(null);

    try {
      await fetchJson(`/api/items/${itemId}/${action}`, { method: "POST" });
      trackAnalyticsEvent(action === "consume" ? "item_consumed" : "item_wasted");
      const outcome = { itemId, itemName, action };
      notifyPantryActionCompleted(outcome);
      setConfirming(null);
      onAction(outcome);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update item.");
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <span className="text-xs text-stone-500 mr-1">
            {confirming === "waste" ? "Waste" : "Use"} {itemName}?
          </span>
          <Button
            size="sm"
            variant={confirming === "waste" ? "destructive" : "default"}
            onClick={() => handleAction(confirming)}
            disabled={loading}
            className="h-7 px-2 text-xs"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setConfirming(null);
              setError(null);
            }}
            className="h-7 px-2 text-xs"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        {error && <span className="text-xs text-terracotta-600">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setError(null);
          setConfirming("consume");
        }}
        className="h-8 text-xs text-sage-700 border-sage-200 hover:bg-sage-50"
      >
        <Check className="h-3 w-3 mr-1" />
        Used
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setError(null);
          setConfirming("waste");
        }}
        className="h-8 text-xs text-terracotta-500 border-terracotta-100 hover:bg-terracotta-50"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Wasted
      </Button>
    </div>
  );
}
