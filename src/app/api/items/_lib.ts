import { db } from "@/db";
import { categories, items, wasteLog } from "@/db/schema";
import { isDateInputValue, toDateInputValue } from "@/lib/dates";
import { and, count, desc, eq } from "drizzle-orm";

export const itemStatuses = ["active", "consumed", "wasted"] as const;
export const MAX_ITEM_NAME_LENGTH = 80;
export const MAX_ITEM_UNIT_LENGTH = 24;
export const MAX_ITEM_NOTES_LENGTH = 500;
export const MAX_ITEM_REQUEST_BODY_BYTES = 8 * 1024;
export const MAX_ITEMS_PER_USER = 500;
export const ITEM_MUTATION_RATE_LIMIT = 60;
export const ITEM_MUTATION_RATE_LIMIT_WINDOW_MS = 60_000;

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

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

const globalForItemSecurity = globalThis as unknown as {
  freshtrackItemMutationBuckets?: Map<string, number[]>;
};

const itemMutationBuckets =
  globalForItemSecurity.freshtrackItemMutationBuckets ?? new Map<string, number[]>();

globalForItemSecurity.freshtrackItemMutationBuckets = itemMutationBuckets;

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

function validateMaxLength(value: string, label: string, maxLength: number) {
  if (value.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }
  return null;
}

export function parseItemId(id: string): number | null {
  return positiveInteger(id);
}

export function isItemStatus(value: string): value is ItemStatus {
  return itemStatuses.includes(value as ItemStatus);
}

export async function categoryExists(categoryId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  return Boolean(row);
}

export function isRequestBodyTooLarge(request: Request): boolean {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return false;

  const byteLength = Number(contentLength);
  return Number.isFinite(byteLength) && byteLength > MAX_ITEM_REQUEST_BODY_BYTES;
}

export function checkItemMutationRateLimit(
  userId: string,
  now = Date.now()
): RateLimitResult {
  const windowStart = now - ITEM_MUTATION_RATE_LIMIT_WINDOW_MS;
  const timestamps = (itemMutationBuckets.get(userId) ?? []).filter(
    (timestamp) => timestamp > windowStart
  );

  if (timestamps.length >= ITEM_MUTATION_RATE_LIMIT) {
    const oldest = timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((ITEM_MUTATION_RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000)
    );
    itemMutationBuckets.set(userId, timestamps);
    return { ok: false, retryAfterSeconds };
  }

  timestamps.push(now);
  itemMutationBuckets.set(userId, timestamps);
  return { ok: true };
}

export async function hasReachedItemLimit(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ value: count() })
    .from(items)
    .where(eq(items.userId, userId));
  return Number(row?.value ?? 0) >= MAX_ITEMS_PER_USER;
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
  const nameLengthError = validateMaxLength(
    name,
    "Item name",
    MAX_ITEM_NAME_LENGTH
  );
  if (nameLengthError) return { ok: false, error: nameLengthError };

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
  const unitLengthError = validateMaxLength(unit, "Unit", MAX_ITEM_UNIT_LENGTH);
  if (unitLengthError) return { ok: false, error: unitLengthError };

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
  if (notes) {
    const notesLengthError = validateMaxLength(
      notes,
      "Notes",
      MAX_ITEM_NOTES_LENGTH
    );
    if (notesLengthError) return { ok: false, error: notesLengthError };
  }

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
    const nameLengthError = validateMaxLength(
      name,
      "Item name",
      MAX_ITEM_NAME_LENGTH
    );
    if (nameLengthError) return { ok: false, error: nameLengthError };
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
    const unitLengthError = validateMaxLength(unit, "Unit", MAX_ITEM_UNIT_LENGTH);
    if (unitLengthError) return { ok: false, error: unitLengthError };
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
    const notes = normalizedText(payload.notes) || null;
    if (notes) {
      const notesLengthError = validateMaxLength(
        notes,
        "Notes",
        MAX_ITEM_NOTES_LENGTH
      );
      if (notesLengthError) return { ok: false, error: notesLengthError };
    }
    data.notes = notes;
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

export async function completeItem(
  itemId: number,
  userId: string,
  action: ItemAction
) {
  return db.transaction(async (tx) => {
    const [item] = await tx
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.userId, userId)))
      .limit(1);

    if (!item) {
      return { status: 404, body: { error: "Item not found." } };
    }

    if (item.status !== "active") {
      return {
        status: 409,
        body: { error: `Item is already marked as ${item.status}.` },
      };
    }

    await tx
      .update(items)
      .set({ status: action, updatedAt: new Date().toISOString() })
      .where(and(eq(items.id, itemId), eq(items.userId, userId)));

    await tx
      .insert(wasteLog)
      .values({
        userId,
        itemId: item.id,
        itemName: item.name,
        action,
        quantity: item.quantity,
        unit: item.unit,
        costEstimate: item.costEstimate,
      });

    return { status: 200, body: { success: true } };
  });
}

export async function restoreItem(itemId: number, userId: string) {
  return db.transaction(async (tx) => {
    const [item] = await tx
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.userId, userId)))
      .limit(1);

    if (!item) {
      return { status: 404, body: { error: "Item not found." } };
    }

    if (item.status === "active") {
      return { status: 200, body: { success: true, restored: false } };
    }

    await tx
      .update(items)
      .set({ status: "active", updatedAt: new Date().toISOString() })
      .where(and(eq(items.id, itemId), eq(items.userId, userId)));

    const [latestLog] = await tx
      .select({ id: wasteLog.id })
      .from(wasteLog)
      .where(
        and(
          eq(wasteLog.userId, userId),
          eq(wasteLog.itemId, itemId),
          eq(wasteLog.action, item.status)
        )
      )
      .orderBy(desc(wasteLog.loggedAt), desc(wasteLog.id))
      .limit(1);

    if (latestLog) {
      await tx
        .delete(wasteLog)
        .where(and(eq(wasteLog.id, latestLog.id), eq(wasteLog.userId, userId)));
    }

    return { status: 200, body: { success: true, restored: true } };
  });
}
