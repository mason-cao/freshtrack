"use client";

import { useEffect, useId, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { fetchJson } from "@/lib/api-client";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { itemFormPatch, itemFormValues } from "@/lib/item-form";
import { useCategories, useItemForm } from "@/hooks/use-item-form";
import { ItemBasicsFields, ItemDetailsFields } from "./item-form-fields";
import type { PantryItem } from "@/lib/pantry";

interface EditItemDialogProps {
  item: PantryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditItemDialog({ item, open, onOpenChange, onSaved }: EditItemDialogProps) {
  const formId = useId();
  const { values, setValues, setField } = useItemForm(item);
  const categoryResource = useCategories(open);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues(itemFormValues(item));
    setConfirmingDelete(false);
    setError(null);
  }, [item, open, setValues]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim() || !values.expirationDate || saving || deleting) return;

    const patch = itemFormPatch(values, item);
    if (Object.keys(patch).length === 0) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await fetchJson(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      trackAnalyticsEvent("item_edited");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await fetchJson(`/api/items/${item.id}`, { method: "DELETE" });
      trackAnalyticsEvent("item_deleted");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete item.");
    } finally {
      setDeleting(false);
    }
  }

  const busy = saving || deleting;

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {item.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ItemBasicsFields
            idPrefix={formId} values={values} onChange={setField}
            categories={categoryResource.data ?? []} loading={categoryResource.loading}
            error={categoryResource.error} onRetry={categoryResource.refresh}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <ItemDetailsFields idPrefix={formId} values={values} onChange={setField} />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-terracotta-50 px-3 py-2 text-sm text-terracotta-600">
              {error}
            </p>
          )}

          {confirmingDelete ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-terracotta-50 px-3 py-2">
              <p className="text-xs text-terracotta-600">
                Delete this item? It won&apos;t count in your stats.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={busy}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={busy}
                >
                  Keep
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-stone-500 hover:bg-terracotta-50 hover:text-terracotta-600"
                onClick={() => setConfirmingDelete(true)}
                disabled={busy}
              >
                <Trash2 className="h-4 w-4" />
                Delete item
              </Button>
              <Button type="submit" disabled={busy}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
