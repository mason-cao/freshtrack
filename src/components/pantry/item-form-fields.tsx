"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PANTRY_UNITS, type PantryCategory } from "@/lib/pantry";
import { MAX_ITEM_NAME_LENGTH, MAX_ITEM_QUANTITY, MAX_ITEM_COST_ESTIMATE } from "@/lib/item-validation";
import type { ItemFormValues } from "@/lib/item-form";

interface FieldsProps {
  idPrefix: string;
  values: ItemFormValues;
  onChange: (field: keyof ItemFormValues, value: string) => void;
}

// Radix Select reserves the empty string for its placeholder.
const NO_CATEGORY = "__none__";

export function ItemBasicsFields({
  idPrefix, values, onChange, categories, loading, error, onRetry,
}: FieldsProps & {
  categories: PantryCategory[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Item name *</Label>
        <Input
          id={`${idPrefix}-name`}
          maxLength={MAX_ITEM_NAME_LENGTH}
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="e.g., Greek Yogurt"
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-category`}>Category</Label>
          <Select
            value={values.categoryId || NO_CATEGORY}
            onValueChange={(value) => onChange("categoryId", value === NO_CATEGORY ? "" : value)}
            disabled={loading || !!error}
          >
            <SelectTrigger id={`${idPrefix}-category`}>
              <SelectValue placeholder={loading ? "Loading..." : error ? "Unavailable" : "Select..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CATEGORY}>No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-expiration`}>Expiration date *</Label>
          <Input
            id={`${idPrefix}-expiration`}
            type="date"
            value={values.expirationDate}
            onChange={(e) => onChange("expirationDate", e.target.value)}
            required
          />
        </div>
      </div>
      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg bg-warm-50 px-3 py-2 text-xs text-stone-600">
          <p>{error} You can still save the other fields.</p>
          <button type="button" onClick={onRetry} className="shrink-0 rounded-md px-2 py-1 font-semibold text-sage-700 hover:bg-sage-50 cursor-pointer">
            Retry
          </button>
        </div>
      )}
    </>
  );
}

export function ItemDetailsFields({ idPrefix, values, onChange }: FieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-quantity`}>Quantity</Label>
        <Input id={`${idPrefix}-quantity`} type="number" step="0.1" min="0.1" max={MAX_ITEM_QUANTITY}
          value={values.quantity} onChange={(e) => onChange("quantity", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-unit`}>Unit</Label>
        <Select value={values.unit} onValueChange={(value) => onChange("unit", value)}>
          <SelectTrigger id={`${idPrefix}-unit`}><SelectValue /></SelectTrigger>
          <SelectContent>
            {!PANTRY_UNITS.some((unit) => unit === values.unit) && (
              <SelectItem value={values.unit}>{values.unit}</SelectItem>
            )}
            {PANTRY_UNITS.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-purchase`}>Purchase date</Label>
        <Input id={`${idPrefix}-purchase`} type="date" value={values.purchaseDate}
          onChange={(e) => onChange("purchaseDate", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-cost`}>Estimated cost</Label>
        <Input id={`${idPrefix}-cost`} type="number" step="0.01" min="0" max={MAX_ITEM_COST_ESTIMATE}
          value={values.costEstimate} onChange={(e) => onChange("costEstimate", e.target.value)} placeholder="0.00" />
      </div>
    </>
  );
}
