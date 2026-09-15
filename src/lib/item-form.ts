import { addDaysToDateInput, toDateInputValue } from "./dates";
import { MAX_ITEM_NAME_LENGTH, type ItemInput } from "./item-validation";
import type { PantryCategory, PantryItem } from "./pantry";
import type { ProductLookupResult } from "./barcode";

type EditableItem = Omit<ItemInput, "notes">;
export type ItemFormValues = { [K in keyof EditableItem]: string };

export function itemFormValues(item?: PantryItem): ItemFormValues {
  return {
    name: item?.name ?? "",
    categoryId: item?.categoryId == null ? "" : String(item.categoryId),
    quantity: String(item?.quantity ?? 1),
    unit: item?.unit ?? "count",
    purchaseDate: item?.purchaseDate ?? toDateInputValue(),
    expirationDate: item?.expirationDate ?? "",
    costEstimate: item?.costEstimate == null ? "" : String(item.costEstimate),
  };
}

export function serializeItemForm(values: ItemFormValues): EditableItem {
  return {
    name: values.name.trim(),
    categoryId: values.categoryId ? Number(values.categoryId) : null,
    quantity: values.quantity ? Number(values.quantity) : 1,
    unit: values.unit,
    purchaseDate: values.purchaseDate,
    expirationDate: values.expirationDate,
    costEstimate: values.costEstimate ? Number(values.costEstimate) : null,
  };
}

export function itemFormPatch(values: ItemFormValues, item: PantryItem): Partial<EditableItem> {
  return Object.fromEntries(
    Object.entries(serializeItemForm(values)).filter(([key, value]) => {
      if ((key === "quantity" || key === "purchaseDate") && !values[key]) return false;
      return value !== item[key as keyof EditableItem];
    })
  );
}

export function suggestExpiration(values: ItemFormValues, categories: PantryCategory[]): ItemFormValues {
  if (values.expirationDate) return values;
  const category = categories.find((entry) => String(entry.id) === values.categoryId);
  return category
    ? { ...values, expirationDate: addDaysToDateInput(category.defaultShelfLifeDays) }
    : values;
}

// Unsupported pack units must not turn a metric weight into a pantry count.
const PRODUCT_UNITS: Record<string, string> = {
  oz: "oz", ounce: "oz", ounces: "oz",
  lb: "lbs", lbs: "lbs", pound: "lbs", pounds: "lbs",
  count: "count", ct: "count", pcs: "count", piece: "count", pieces: "count", unit: "count", units: "count",
};

export function productFormPatch(product: ProductLookupResult): Partial<ItemFormValues> {
  const patch: Partial<ItemFormValues> = {};
  if (product.name) patch.name = product.name.slice(0, MAX_ITEM_NAME_LENGTH);
  if (product.categoryId !== null) patch.categoryId = String(product.categoryId);
  const unit = product.unit ? PRODUCT_UNITS[product.unit] : undefined;
  if (product.quantity && unit) {
    patch.quantity = String(product.quantity);
    patch.unit = unit;
  }
  return patch;
}
