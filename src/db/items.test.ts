import { describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

const transaction = vi.hoisted(() => vi.fn());
vi.mock("@/db", () => ({ db: { transaction } }));
import { restoreItem } from "./items";

function mockRestore(item: { id: number; status: string } | undefined, latestLogId?: number) {
  const lock = vi.fn(async () => item ? [item] : []);
  const itemWhere = vi.fn<(condition: SQL) => { limit: () => { for: typeof lock } }>(
    () => ({ limit: () => ({ for: lock }) })
  );
  const logWhere = vi.fn(() => ({ orderBy: () => ({ limit: async () => latestLogId ? [{ id: latestLogId }] : [] }) }));
  const updateWhere = vi.fn<(condition: SQL) => Promise<void>>(async () => undefined);
  const deleteWhere = vi.fn<(condition: SQL) => Promise<void>>(async () => undefined);
  const tx = {
    select: vi.fn().mockReturnValueOnce({ from: () => ({ where: itemWhere }) }).mockReturnValue({ from: () => ({ where: logWhere }) }),
    update: vi.fn(() => ({ set: () => ({ where: updateWhere }) })),
    delete: vi.fn(() => ({ where: deleteWhere })),
  };
  transaction.mockImplementationOnce(async (callback) => callback(tx));
  return { tx, lock, itemWhere, updateWhere, deleteWhere };
}

describe("restoreItem", () => {
  it("locks the owner's row before changing status and only removes the latest matching log", async () => {
    const { tx, lock, itemWhere, updateWhere, deleteWhere } = mockRestore({ id: 7, status: "consumed" }, 21);
    const result = await restoreItem(7, "owner");
    expect(result).toEqual({ status: 200, body: { success: true, restored: true } });
    expect(lock).toHaveBeenCalledWith("update");
    expect(lock.mock.invocationCallOrder[0]).toBeLessThan(tx.update.mock.invocationCallOrder[0]);
    const dialect = new PgDialect();
    expect(dialect.sqlToQuery(itemWhere.mock.calls[0][0]).params).toEqual([7, "owner"]);
    expect(dialect.sqlToQuery(updateWhere.mock.calls[0][0]).params).toEqual([7, "owner"]);
    expect(dialect.sqlToQuery(deleteWhere.mock.calls[0][0]).params).toEqual([21, "owner"]);
  });

  it("does not alter history when the item has already been restored", async () => {
    const { tx } = mockRestore({ id: 7, status: "active" });
    expect(await restoreItem(7, "owner")).toEqual({ status: 200, body: { success: true, restored: false } });
    expect(tx.update).not.toHaveBeenCalled();
    expect(tx.delete).not.toHaveBeenCalled();
  });

  it("returns not found without writes when the owner has no matching item", async () => {
    const { tx } = mockRestore(undefined);
    expect((await restoreItem(7, "other-owner")).status).toBe(404);
    expect(tx.update).not.toHaveBeenCalled();
    expect(tx.delete).not.toHaveBeenCalled();
  });
});
