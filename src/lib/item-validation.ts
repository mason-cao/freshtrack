import { isDateInputValue, toDateInputValue } from "./dates";

export const itemStatuses = ["active", "consumed", "wasted"] as const;
export type ItemStatus = (typeof itemStatuses)[number];
export type ItemAction = Extract<ItemStatus, "consumed" | "wasted">;
export const MAX_ITEM_NAME_LENGTH = 80;
export const MAX_ITEM_UNIT_LENGTH = 24;
export const MAX_ITEM_NOTES_LENGTH = 500;
export const MAX_ITEMS_PER_USER = 500;
export const MAX_ITEM_QUANTITY = 1_000_000;
export const MAX_ITEM_COST_ESTIMATE = 1_000_000;

export interface ItemInput {
  name: string;
  categoryId: number | null;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expirationDate: string;
  costEstimate: number | null;
  notes: string | null;
}
export type ItemPatch = Partial<ItemInput>;
type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown) {
  return typeof value === "number" || (typeof value === "string" && value.trim())
    ? Number(value)
    : NaN;
}

export function parseItemId(value: unknown): number | null {
  const parsed = number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function isItemStatus(value: string): value is ItemStatus {
  return itemStatuses.includes(value as ItemStatus);
}

function requiredText(value: unknown, label: string, max: number): ValidationResult<string> {
  const data = text(value);
  if (!data) return { ok: false, error: `${label} cannot be empty.` };
  if (data.length > max) return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  return { ok: true, data };
}

function date(value: unknown, label: string): ValidationResult<string> {
  const data = text(value);
  return isDateInputValue(data)
    ? { ok: true, data }
    : { ok: false, error: `${label} must be a valid YYYY-MM-DD date.` };
}

const fields: { [K in keyof ItemInput]: (value: unknown) => ValidationResult<ItemInput[K]> } = {
  name: (value) => requiredText(value, "Item name", MAX_ITEM_NAME_LENGTH),
  categoryId: (value) => {
    if (value === null || value === "") return { ok: true, data: null };
    const data = parseItemId(value);
    return data === null
      ? { ok: false, error: "Category must be a valid category id." }
      : { ok: true, data };
  },
  quantity: (value) => {
    const data = number(value);
    return Number.isFinite(data) && data > 0 && data <= MAX_ITEM_QUANTITY
      ? { ok: true, data }
      : { ok: false, error: `Quantity must be greater than zero and no more than ${MAX_ITEM_QUANTITY.toLocaleString("en-US")}.` };
  },
  unit: (value) => requiredText(value, "Unit", MAX_ITEM_UNIT_LENGTH),
  purchaseDate: (value) => date(value, "Purchase date"),
  expirationDate: (value) => date(value, "Expiration date"),
  costEstimate: (value) => {
    if (value === null || value === "") return { ok: true, data: null };
    const data = number(value);
    return Number.isFinite(data) && data >= 0 && data <= MAX_ITEM_COST_ESTIMATE
      ? { ok: true, data }
      : { ok: false, error: `Cost estimate must be between zero and ${MAX_ITEM_COST_ESTIMATE.toLocaleString("en-US")}.` };
  },
  notes: (value) => text(value)
    ? requiredText(value, "Notes", MAX_ITEM_NOTES_LENGTH)
    : { ok: true, data: null },
};

function parseFields(payload: Record<string, unknown>): ValidationResult<ItemPatch> {
  const data: ItemPatch = {};
  for (const key of Object.keys(fields) as (keyof ItemInput)[]) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) continue;
    const result = fields[key](payload[key]);
    if (!result.ok) return result;
    Object.assign(data, { [key]: result.data });
  }
  return { ok: true, data };
}

export function validateCreateItemPayload(payload: unknown): ValidationResult<ItemInput> {
  if (!isRecord(payload)) return { ok: false, error: "Expected a JSON object." };
  if (!text(payload.name)) return { ok: false, error: "Item name is required." };

  // Create supplies every field; PATCH leaves omitted fields unchanged.
  return parseFields({
    name: payload.name,
    categoryId: payload.categoryId ?? null,
    quantity: payload.quantity === undefined || payload.quantity === "" ? 1 : payload.quantity,
    unit: text(payload.unit) || "count",
    purchaseDate: text(payload.purchaseDate) || toDateInputValue(),
    expirationDate: payload.expirationDate,
    costEstimate: payload.costEstimate ?? null,
    notes: payload.notes ?? null,
  }) as ValidationResult<ItemInput>;
}

export function validatePatchItemPayload(payload: unknown): ValidationResult<ItemPatch> {
  if (!isRecord(payload)) return { ok: false, error: "Expected a JSON object." };
  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    return { ok: false, error: "Use the consume, waste, or restore endpoints to change item status." };
  }
  const result = parseFields(payload);
  if (result.ok && Object.keys(result.data).length === 0) {
    return { ok: false, error: "No valid item fields were provided." };
  }
  return result;
}
