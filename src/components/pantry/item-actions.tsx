"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Trash2, X } from "lucide-react";

interface ItemActionsProps {
  itemId: number;
  itemName: string;
  onAction: () => void;
}

export function ItemActions({ itemId, itemName, onAction }: ItemActionsProps) {
  const [confirming, setConfirming] = useState<"consume" | "waste" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "consume" | "waste") {
    setLoading(true);
    await fetch(`/api/items/${itemId}/${action}`, { method: "POST" });
    setLoading(false);
    setConfirming(null);
    onAction();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1">
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
          onClick={() => setConfirming(null)}
          className="h-7 px-2 text-xs"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setConfirming("consume")}
        className="h-8 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
      >
        <Check className="h-3 w-3 mr-1" />
        Used
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setConfirming("waste")}
        className="h-8 text-xs text-red-700 border-red-200 hover:bg-red-50"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Wasted
      </Button>
    </div>
  );
}
