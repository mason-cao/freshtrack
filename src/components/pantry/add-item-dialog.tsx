"use client";

import { useEffect, useId, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, Plus, ScanBarcode } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { recordPantryAction } from "@/lib/install-prompt-eligibility";
import { fetchJson } from "@/lib/api-client";
import { itemFormValues, productFormPatch, serializeItemForm, suggestExpiration } from "@/lib/item-form";
import { useCategories, useItemForm } from "@/hooks/use-item-form";
import { useProductLookup } from "@/hooks/use-product-lookup";
import { BarcodeScanner } from "./barcode-scanner";
import { ItemBasicsFields, ItemDetailsFields } from "./item-form-fields";
import type { PantryCategory } from "@/lib/pantry";

interface AddItemDialogProps {
  onItemAdded: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

const EMPTY_CATEGORIES: PantryCategory[] = [];
// Submit-button value for "Save & add another", read from the submit event.
const ADD_ANOTHER = "add-another";

export function AddItemDialog({
  onItemAdded, open: controlledOpen, onOpenChange, showTrigger = true,
}: AddItemDialogProps) {
  const formId = useId();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  function setOpen(next: boolean) {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }
  const { values, setValues, setField } = useItemForm();
  const categoryResource = useCategories(open);
  const categories = categoryResource.data ?? EMPTY_CATEGORIES;
  const productLookup = useProductLookup(open);
  const [saving, setSaving] = useState<"close" | "another" | null>(null);
  // Name of the item just saved with "Save & add another", shown as feedback.
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const selectedCategory = categories.find((category) => String(category.id) === values.categoryId);

  useEffect(() => {
    setValues((current) => suggestExpiration(current, categories));
  }, [categories, values.categoryId, setValues]);

  useEffect(() => {
    if (!open) setScannerOpen(false);
  }, [open]);

  function handleBarcodeDetected(barcode: string) {
    setScannerOpen(false);
    void productLookup.lookup(barcode, (product) => {
      const patch = productFormPatch(product);
      setValues((current) => suggestExpiration({ ...current, ...patch }, categories));
      if (patch.quantity) setDetailsOpen(true);
    });
  }

  function handleDialogOpenChange(next: boolean) {
    if (saving) return;
    if (!next) {
      productLookup.cancel();
      setScannerOpen(false);
      setLastAdded(null);
    }
    setOpen(next);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.name.trim() || !values.expirationDate || saving || productLookup.pending) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const addAnother = submitter instanceof HTMLButtonElement && submitter.value === ADD_ANOTHER;
    const addedName = values.name.trim();
    setSaving(addAnother ? "another" : "close");
    setError(null);
    try {
      await fetchJson("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serializeItemForm(values)),
      });
      trackAnalyticsEvent("item_added");
      recordPantryAction();
      setValues(itemFormValues());
      setDetailsOpen(false);
      productLookup.cancel();
      if (addAnother) {
        // Stay open for the next item, e.g. while unpacking groceries.
        setLastAdded(addedName);
        document.getElementById(`${formId}-name`)?.focus();
      } else {
        setLastAdded(null);
        setOpen(false);
      }
      onItemAdded();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to add item.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{scannerOpen ? "Scan barcode" : "Add pantry item"}</DialogTitle>
        </DialogHeader>
        {scannerOpen ? (
          <BarcodeScanner
            onDetected={handleBarcodeDetected}
            onCancel={() => setScannerOpen(false)}
          />
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              productLookup.clearNote();
              setScannerOpen(true);
            }}
            disabled={productLookup.pending}
          >
            <ScanBarcode className="h-4 w-4" />
            Scan barcode
          </Button>

          {productLookup.pending && (
            <p role="status" className="flex items-center gap-2 rounded-lg bg-sage-50 px-3 py-2 text-xs text-sage-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Looking up product…
            </p>
          )}
          {productLookup.note && (
            <p
              className={
                productLookup.note.tone === "ok"
                  ? "rounded-lg bg-sage-50 px-3 py-2 text-xs text-sage-700"
                  : "rounded-lg bg-warm-50 px-3 py-2 text-xs text-stone-600"
              }
            >
              {productLookup.note.text}
            </p>
          )}

          {lastAdded && (
            <p role="status" className="rounded-lg bg-sage-50 px-3 py-2 text-xs text-sage-700">
              Added “{lastAdded}”. Add the next item.
            </p>
          )}

          <ItemBasicsFields
            idPrefix={formId} values={values} onChange={setField}
            categories={categories} loading={categoryResource.loading}
            error={categoryResource.error} onRetry={categoryResource.refresh}
          />
          {selectedCategory && values.expirationDate && (
            <p className="rounded-lg bg-sage-50 px-3 py-2 text-xs text-sage-700">
              Using the usual {selectedCategory.defaultShelfLifeDays}-day window for {selectedCategory.name.toLowerCase()}.
            </p>
          )}

          <div className="rounded-xl border border-warm-100 bg-warm-50/60">
            <button
              type="button"
              aria-expanded={detailsOpen}
              aria-controls={`${formId}-details`}
              onClick={() => setDetailsOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left cursor-pointer"
            >
              <div>
                <p className="text-sm font-semibold text-stone-900">Details</p>
                <p className="text-xs text-stone-500">
                  {values.quantity || "1"} {values.unit}
                  {values.costEstimate ? `, ${values.costEstimate} estimated` : ""}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${
                  detailsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div id={`${formId}-details`} className={detailsOpen ? "grid gap-3 border-t border-warm-100 p-3 sm:grid-cols-2" : "hidden"}>
              <ItemDetailsFields idPrefix={formId} values={values} onChange={setField} />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-terracotta-50 px-3 py-2 text-sm text-terracotta-600">
              {error}
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button type="submit" className="w-full" disabled={!!saving || productLookup.pending}>
              {saving === "close" ? "Adding..." : "Add to Pantry"}
            </Button>
            <Button
              type="submit"
              value={ADD_ANOTHER}
              variant="outline"
              className="w-full"
              disabled={!!saving || productLookup.pending}
            >
              {saving === "another" ? "Adding..." : "Save & add another"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
