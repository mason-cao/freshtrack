import { describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: dbMock,
}));

import { completeItem } from "./_lib";

function directQueryChunks(value: unknown): unknown[] | null {
  if (typeof value !== "object" || value === null) return null;
  const chunks = (value as { queryChunks?: unknown }).queryChunks;
  return Array.isArray(chunks) ? chunks : null;
}

function isColumnNamed(value: unknown, name: string): boolean {
  if (typeof value !== "object" || value === null) return false;
  const record = value as { name?: unknown; columnType?: unknown };
  return record.name === name && typeof record.columnType === "string";
}

function isParamValue(value: unknown, expected: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const record = value as { value?: unknown; encoder?: unknown };
  return record.value === expected && record.encoder !== undefined;
}

function hasDirectColumnParamPair(
  value: unknown,
  columnName: string,
  paramValue: unknown
): boolean {
  const chunks = directQueryChunks(value);
  if (!chunks) return false;

  for (let i = 0; i < chunks.length; i++) {
    if (
      isColumnNamed(chunks[i], columnName) &&
      chunks.slice(i + 1).some((chunk) => isParamValue(chunk, paramValue))
    ) {
      return true;
    }
  }

  return chunks.some((chunk) =>
    hasDirectColumnParamPair(chunk, columnName, paramValue)
  );
}

describe("completeItem", () => {
  it("guards completion updates by active status before writing a waste log", async () => {
    const activeItem = {
      id: 7,
      userId: "user_1",
      name: "Greek yogurt",
      status: "active",
      quantity: 2,
      unit: "container",
      costEstimate: 5.5,
    };
    let updateCondition: unknown;
    const updateReturning = vi.fn(async () => [activeItem]);
    const updateWhere = vi.fn((condition: unknown) => {
      updateCondition = condition;
      return { returning: updateReturning };
    });
    const insertValues = vi.fn(async () => undefined);
    const tx = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(async () => [activeItem]),
          })),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: updateWhere,
        })),
      })),
      insert: vi.fn(() => ({
        values: insertValues,
      })),
    };

    dbMock.transaction.mockImplementationOnce(async (callback) => callback(tx));

    const result = await completeItem(activeItem.id, activeItem.userId, "wasted");

    expect(result.status).toBe(200);
    expect(hasDirectColumnParamPair(updateCondition, "status", "active")).toBe(true);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: activeItem.userId,
        itemId: activeItem.id,
        itemName: activeItem.name,
        action: "wasted",
      })
    );
  });
});
