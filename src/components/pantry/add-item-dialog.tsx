"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ChevronDown, Loader2, Plus, ScanBarcode } from "lucide-react";
import { addDaysToDateInput, toDateInputValue } from "@/lib/dates";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { fetchJson } from "@/lib/api-client";
import { BarcodeScanner } from "@/components/pantry/barcode-scanner";
import { PANTRY_UNITS } from "@/lib/pantry";
import type { ProductLookupResult } from "@/app/api/products/[barcode]/route";

// Open Food Facts reports metric/imperial units; map the ones that fit the
// add-item form's unit list. Anything else (g, ml, kg…) can't be represented
// here, so we skip the quantity prefill rather than show a misleading value.
const OFF_UNIT_MAP: Record<string, string> = {
  oz: "oz",
  ounce: "oz",
  ounces: "oz",
  lb: "lbs",
  lbs: "lbs",
  pound: "lbs",
  pounds: "lbs",
  count: "count",
  ct: "count",
  pcs: "count",
  piece: "count",
  pieces: "count",
  unit: "count",
  units: "count",
};

interface Category {
  id: number;
  name: string;
  icon: string;
  defaultShelfLifeDays: number;
}

interface AddItemDialogProps {
  onItemAdded: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

type CategoryStatus = "idle" | "loading" | "ready" | "error";

export function AddItemDialog({
  onItemAdded,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: AddItemDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryStatus, setCategoryStatus] = useState<CategoryStatus>("idle");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lookupPending, setLookupPending] = useState(false);
  const [lookupNote, setLookupNote] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("count");
  const [purchaseDate, setPurchaseDate] = useState(toDateInputValue());
  const [expirationDate, setExpirationDate] = useState("");
  const [costEstimate, setCostEstimate] = useState("");
  const selectedCategory = categories.find((cat) => cat.id === Number.parseInt(categoryId, 10));

  useEffect(() => {
    if (!open || categoryStatus !== "idle") return;

    let cancelled = false;
    setCategoryStatus("loading");
    setCategoryError(null);

    fetchJson<Category[]>("/api/categories")
      .then((data) => {
        if (cancelled) return;
        setCategories(data);
        setCategoryStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setCategoryStatus("error");
        setCategoryError(
          err instanceof Error ? err.message : "Unable to load categories."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [categoryStatus, open]);

  useEffect(() => {
    if (!categoryId || expirationDate) return;
    const cat = categories.find((c) => c.id === Number.parseInt(categoryId, 10));
    if (cat) setExpirationDate(addDaysToDateInput(cat.defaultShelfLifeDays));
  }, [categories, categoryId, expirationDate]);

  function retryCategories() {
    setCategoryStatus("idle");
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    const cat = categories.find((c) => c.id === Number.parseInt(value, 10));
    if (cat && !expirationDate) {
      setExpirationDate(addDaysToDateInput(cat.defaultShelfLifeDays));
    }
  }

  function applyProduct(product: ProductLookupResult) {
    if (product.name) setName(product.name.slice(0, 80));
    if (product.categoryId !== null) {
      // Reuse the category change handler so the shelf-life default fills in too.
      handleCategoryChange(String(product.categoryId));
    }
    const mappedUnit = product.unit ? OFF_UNIT_MAP[product.unit] : undefined;
    if (product.quantity && mappedUnit) {
      setQuantity(String(product.quantity));
      setUnit(mappedUnit);
      setDetailsOpen(true); // surface the prefilled amount
    }
  }

  async function handleBarcodeDetected(barcode: string) {
    setScannerOpen(false);
    setLookupPending(true);
    setLookupNote(null);
    trackAnalyticsEvent("barcode_scanned");
    try {
      const product = await fetchJson<ProductLookupResult>(`/api/products/${barcode}`);
      if (product.found) {
        applyProduct(product);
        trackAnalyticsEvent("barcode_lookup_hit");
        setLookupNote({
          tone: "ok",
          text: product.name
            ? `Prefilled “${product.name}”. Review and save.`
            : "Prefilled from the scanned product. Review and save.",
        });
      } else {
        trackAnalyticsEvent("barcode_lookup_miss");
        setLookupNote({ tone: "warn", text: "We couldn't find that product. Add the details below." });
      }
    } catch {
      trackAnalyticsEvent("barcode_lookup_miss");
      setLookupNote({ tone: "warn", text: "Lookup failed. Add the details below." });
    } finally {
      setLookupPending(false);
    }
  }

  function handleDialogOpenChange(next: boolean) {
    if (!next) {
      // Reset scan state so a reopened dialog starts clean (and the camera,
      // if open, unmounts and releases the stream).
      setScannerOpen(false);
      setLookupPending(false);
      setLookupNote(null);
    }
    setOpen(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !expirationDate) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categoryId: categoryId ? Number.parseInt(categoryId, 10) : null,
          quantity: quantity ? parseFloat(quantity) : 1,
          unit,
          purchaseDate,
          expirationDate,
          costEstimate: costEstimate ? parseFloat(costEstimate) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Unable to add item.");
      }

      trackAnalyticsEvent("item_added");

      // Reset form
      setName("");
      setCategoryId("");
      setQuantity("1");
      setUnit("count");
      setPurchaseDate(toDateInputValue());
      setExpirationDate("");
      setCostEstimate("");
      setDetailsOpen(false);
      setOpen(false);
      onItemAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add item.");
    } finally {
      setSaving(false);
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
              setLookupNote(null);
              setScannerOpen(true);
            }}
            disabled={lookupPending}
          >
            <ScanBarcode className="h-4 w-4" />
            Scan barcode
          </Button>

          {lookupPending && (
            <p className="flex items-center gap-2 rounded-lg bg-sage-50 px-3 py-2 text-xs text-sage-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Looking up product…
            </p>
          )}
          {lookupNote && (
            <p
              className={
                lookupNote.tone === "ok"
                  ? "rounded-lg bg-sage-50 px-3 py-2 text-xs text-sage-700"
                  : "rounded-lg bg-warm-50 px-3 py-2 text-xs text-stone-600"
              }
            >
              {lookupNote.text}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Item name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Greek Yogurt"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryId}
                onValueChange={handleCategoryChange}
                disabled={categoryStatus === "loading" || categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      categoryStatus === "loading"
                        ? "Loading..."
                        : categoryStatus === "error"
                          ? "Unavailable"
                          : "Select..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration date *</Label>
              <Input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                required
              />
            </div>
          </div>

          {selectedCategory && expirationDate && (
            <p className="rounded-lg bg-sage-50 px-3 py-2 text-xs text-sage-700">
              Using the usual {selectedCategory.defaultShelfLifeDays}-day window for {selectedCategory.name.toLowerCase()}.
            </p>
          )}

          {categoryStatus === "error" && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-warm-50 px-3 py-2 text-xs text-stone-600">
              <p>{categoryError ?? "Categories are unavailable. You can still save without one."}</p>
              <button
                type="button"
                onClick={retryCategories}
                className="shrink-0 rounded-md px-2 py-1 font-semibold text-sage-700 transition-colors hover:bg-sage-50 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div className="rounded-xl border border-warm-100 bg-warm-50/60">
            <button
              type="button"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left cursor-pointer"
            >
              <div>
                <p className="text-sm font-semibold text-stone-900">Details</p>
                <p className="text-xs text-stone-500">
                  {quantity || "1"} {unit}
                  {costEstimate ? `, ${costEstimate} estimated` : ""}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${
                  detailsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div className={detailsOpen ? "grid gap-3 border-t border-warm-100 p-3 sm:grid-cols-2" : "hidden"}>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
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
                <Label htmlFor="purchaseDate">Purchase date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Estimated cost</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={costEstimate}
                  onChange={(e) => setCostEstimate(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-terracotta-50 px-3 py-2 text-sm text-terracotta-600">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Adding..." : "Add to Pantry"}
          </Button>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
