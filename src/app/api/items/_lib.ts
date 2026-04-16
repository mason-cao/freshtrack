import { db } from "@/db";
import { categories, items, wasteLog } from "@/db/schema";
import { isDateInputValue, toDateInputValue } from "@/lib/dates";
import { eq } from "drizzle-orm";

export const itemStatuses = ["active", "consumed", "wasted"] as const;

export type ItemStatus = (typeof itemStatuses)[number];
export type ItemAction = Extract<ItemStatus, "consumed" | "wasted">;

interface ItemInput {
  name: string;
  categoryId: number | null;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expirationDate: string;
  costEstimate: number | null;
  notes: string | null;
}

type ItemPatch = Partial<ItemInput> & {
  status?: ItemStatus;
};

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPresent(record: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function isEmptyInput(value: unknown) {
  return value === null || value === undefined || value === "";
}

function positiveNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function nonNegativeNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null;
}

function positiveInteger(value: unknown) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
}

function normalizedText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseItemId(id: string): number | null {
  return positiveInteger(id);
}

export function isItemStatus(value: string): value is ItemStatus {
  return itemStatuses.includes(value as ItemStatus);
}

export function categoryExists(categoryId: number): boolean {
  return Boolean(
    db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .get()
  );
}

export function validateCreateItemPayload(
  payload: unknown
): ValidationResult<ItemInput> {
  if (!isRecord(payload)) {
    return { ok: false, error: "Expected a JSON object." };
  }

  const name = normalizedText(payload.name);
  if (!name) {
    return { ok: false, error: "Item name is required." };
  }

  const expirationDate = normalizedText(payload.expirationDate);
  if (!isDateInputValue(expirationDate)) {
    return {
      ok: false,
      error: "Expiration date must be a valid YYYY-MM-DD date.",
    };
  }

  const categoryId = isEmptyInput(payload.categoryId)
    ? null
    : positiveInteger(payload.categoryId);
  if (categoryId === null && !isEmptyInput(payload.categoryId)) {
    return { ok: false, error: "Category must be a valid category id." };
  }

  const quantity =
    payload.quantity === undefined || payload.quantity === ""
      ? 1
      : positiveNumber(payload.quantity);
  if (quantity === null) {
    return { ok: false, error: "Quantity must be greater than zero." };
  }

  const unit = normalizedText(payload.unit) || "count";

  const purchaseDate = normalizedText(payload.purchaseDate) || toDateInputValue();
  if (!isDateInputValue(purchaseDate)) {
    return {
      ok: false,
      error: "Purchase date must be a valid YYYY-MM-DD date.",
    };
  }

  const costEstimate = isEmptyInput(payload.costEstimate)
    ? null
    : nonNegativeNumber(payload.costEstimate);
  if (costEstimate === null && !isEmptyInput(payload.costEstimate)) {
    return { ok: false, error: "Cost estimate must be zero or greater." };
  }

  const notes = normalizedText(payload.notes) || null;

  return {
    ok: true,
    data: {
      name,
      categoryId,
      quantity,
      unit,
      purchaseDate,
      expirationDate,
      costEstimate,
      notes,
    },
  };
}

export function validatePatchItemPayload(
  payload: unknown
): ValidationResult<ItemPatch> {
  if (!isRecord(payload)) {
    return { ok: false, error: "Expected a JSON object." };
  }

  const data: ItemPatch = {};

  if (isPresent(payload, "name")) {
    const name = normalizedText(payload.name);
    if (!name) return { ok: false, error: "Item name cannot be empty." };
    data.name = name;
  }

  if (isPresent(payload, "categoryId")) {
    if (payload.categoryId === null || payload.categoryId === "") {
      data.categoryId = null;
    } else {
      const categoryId = positiveInteger(payload.categoryId);
      if (categoryId === null) {
        return { ok: false, error: "Category must be a valid category id." };
      }
      data.categoryId = categoryId;
    }
  }

  if (isPresent(payload, "quantity")) {
    const quantity = positiveNumber(payload.quantity);
    if (quantity === null) {
      return { ok: false, error: "Quantity must be greater than zero." };
    }
    data.quantity = quantity;
  }

  if (isPresent(payload, "unit")) {
    const unit = normalizedText(payload.unit);
    if (!unit) return { ok: false, error: "Unit cannot be empty." };
    data.unit = unit;
  }

  if (isPresent(payload, "purchaseDate")) {
    const purchaseDate = normalizedText(payload.purchaseDate);
    if (!isDateInputValue(purchaseDate)) {
      return {
        ok: false,
        error: "Purchase date must be a valid YYYY-MM-DD date.",
      };
    }
    data.purchaseDate = purchaseDate;
  }

  if (isPresent(payload, "expirationDate")) {
    const expirationDate = normalizedText(payload.expirationDate);
    if (!isDateInputValue(expirationDate)) {
      return {
        ok: false,
        error: "Expiration date must be a valid YYYY-MM-DD date.",
      };
    }
    data.expirationDate = expirationDate;
  }

  if (isPresent(payload, "costEstimate")) {
    if (payload.costEstimate === null || payload.costEstimate === "") {
      data.costEstimate = null;
    } else {
      const costEstimate = nonNegativeNumber(payload.costEstimate);
      if (costEstimate === null) {
        return { ok: false, error: "Cost estimate must be zero or greater." };
      }
      data.costEstimate = costEstimate;
    }
  }

  if (isPresent(payload, "notes")) {
    data.notes = normalizedText(payload.notes) || null;
  }

  if (isPresent(payload, "status")) {
    if (typeof payload.status !== "string" || !isItemStatus(payload.status)) {
      return { ok: false, error: "Status must be active, consumed, or wasted." };
    }
    data.status = payload.status;
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "No valid item fields were provided." };
  }

  return { ok: true, data };
}

export function completeItem(itemId: number, action: ItemAction) {
  return db.transaction((tx) => {
    const item = tx.select().from(items).where(eq(items.id, itemId)).get();

    if (!item) {
      return { status: 404, body: { error: "Item not found." } };
    }

    if (item.status !== "active") {
      return {
        status: 409,
        body: { error: `Item is already marked as ${item.status}.` },
      };
    }

    tx.update(items)
      .set({ status: action, updatedAt: new Date().toISOString() })
      .where(eq(items.id, itemId))
      .run();

    tx.insert(wasteLog)
      .values({
        itemId: item.id,
        itemName: item.name,
        action,
        quantity: item.quantity,
        unit: item.unit,
        costEstimate: item.costEstimate,
      })
      .run();

    return { status: 200, body: { success: true } };
  });
}
