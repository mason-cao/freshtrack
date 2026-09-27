"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Pencil, Trash2 } from "lucide-react";
import { completePantryItem } from "@/lib/pantry-actions";
import {
  type PantryActionOutcome,
  type PantryCompletionAction,
} from "@/lib/pantry-events";
import { EditItemDialog } from "./edit-item-dialog";
import type { PantryItem } from "@/lib/pantry";

interface ItemActionsProps {
  itemId: number;
  itemName: string;
  onAction: (outcome?: PantryActionOutcome) => void;
  /** When the full row is available, an Edit button opens the edit dialog. */
  item?: PantryItem;
}

export function ItemActions({ itemId, itemName, onAction, item }: ItemActionsProps) {
  const [saving, setSaving] = useState<PantryCompletionAction | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One tap, no confirmation: the undo toast shown after every pantry action
  // is the safety net for a mis-tap.
  async function handleAction(action: PantryCompletionAction) {
    if (saving) return;
    setSaving(action);
    setError(null);

    try {
      const outcome = await completePantryItem({ itemId, itemName, action });
      onAction(outcome);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update item.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction("consume")}
          disabled={!!saving}
          aria-label={`Mark ${itemName} used`}
          className="h-8 text-xs text-sage-700 border-sage-200 hover:bg-sage-50"
        >
          <Check className="h-3 w-3 mr-1" />
          {saving === "consume" ? "Saving" : "Used"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction("waste")}
          disabled={!!saving}
          aria-label={`Mark ${itemName} wasted`}
          className="h-8 text-xs text-terracotta-500 border-terracotta-100 hover:bg-terracotta-50"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          {saving === "waste" ? "Saving" : "Wasted"}
        </Button>
        {item && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              disabled={!!saving}
              aria-label={`Edit ${itemName}`}
              className="h-8 w-8 p-0 text-stone-400 hover:text-stone-700"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <EditItemDialog
              item={item}
              open={editing}
              onOpenChange={setEditing}
              onSaved={() => onAction()}
            />
          </>
        )}
      </div>
      {error && <span role="alert" className="text-xs text-terracotta-600">{error}</span>}
    </div>
  );
}
