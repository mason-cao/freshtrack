"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { fetchJson } from "@/lib/api-client";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { PANTRY_UNITS, type PantryItem } from "@/lib/pantry";

interface Category {
  id: number;
  name: string;
  icon: string;
  defaultShelfLifeDays: number;
}

interface EditItemDialogProps {
  item: PantryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful save or delete so the parent can refresh. */
  onSaved: () => void;
}

// Radix Select has no null value, so a sentinel stands in for "no category".
const NO_CATEGORY = "__none__";

export function EditItemDialog({ item, open, onOpenChange, onSaved }: EditItemDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(item.name);
  const [categoryId, setCategoryId] = useState(
    item.categoryId === null ? NO_CATEGORY : String(item.categoryId)
  );
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState(item.unit);
  const [purchaseDate, setPurchaseDate] = useState(item.purchaseDate);
  const [expirationDate, setExpirationDate] = useState(item.expirationDate);
  const [costEstimate, setCostEstimate] = useState(
    item.costEstimate === null ? "" : String(item.costEstimate)
  );

  // Re-seed the form whenever a different item is opened.
  useEffect(() => {
    if (!open) return;
    setName(item.name);
    setCategoryId(item.categoryId === null ? NO_CATEGORY : String(item.categoryId));
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setPurchaseDate(item.purchaseDate);
    setExpirationDate(item.expirationDate);
    setCostEstimate(item.costEstimate === null ? "" : String(item.costEstimate));
    setConfirmingDelete(false);
    setError(null);
  }, [item, open]);

  useEffect(() => {
    if (!open || categoriesLoaded) return;
    fetchJson<Category[]>("/api/categories")
      .then((data) => {
        setCategories(data);
        setCategoriesLoaded(true);
      })
      .catch(() => {
        // The select stays disabled; everything else remains editable.
      });
  }, [open, categoriesLoaded]);

  function buildPatch(): Record<string, unknown> {
    const patch: Record<string, unknown> = {};
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== item.name) patch.name = trimmedName;

    const nextCategoryId =
      categoryId === NO_CATEGORY ? null : Number.parseInt(categoryId, 10);
    if (nextCategoryId !== item.categoryId) patch.categoryId = nextCategoryId;

    const nextQuantity = Number.parseFloat(quantity);
    if (Number.isFinite(nextQuantity) && nextQuantity !== item.quantity) {
      patch.quantity = nextQuantity;
    }

    if (unit !== item.unit) patch.unit = unit;
    if (purchaseDate && purchaseDate !== item.purchaseDate) patch.purchaseDate = purchaseDate;
    if (expirationDate && expirationDate !== item.expirationDate) {
      patch.expirationDate = expirationDate;
    }

    const nextCost = costEstimate === "" ? null : Number.parseFloat(costEstimate);
    if (nextCost !== item.costEstimate) patch.costEstimate = nextCost;

    return patch;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !expirationDate) return;

    const patch = buildPatch();
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
          <div className="space-y-2">
            <Label htmlFor="edit-name">Item name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={!categoriesLoaded}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoaded ? "Select..." : "Loading..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-expiration">Expiration date *</Label>
              <Input
                id="edit-expiration"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PANTRY_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-purchase">Purchase date</Label>
              <Input
                id="edit-purchase"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cost">Estimated cost</Label>
              <Input
                id="edit-cost"
                type="number"
                step="0.01"
                min="0"
                value={costEstimate}
                onChange={(e) => setCostEstimate(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-terracotta-50 px-3 py-2 text-sm text-terracotta-600">
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
