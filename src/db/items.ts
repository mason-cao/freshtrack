import { db } from "@/db";
import { categories, items, wasteLog } from "@/db/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { MAX_ITEMS_PER_USER, type ItemAction } from "@/lib/item-validation";

export async function categoryExists(categoryId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  return Boolean(row);
}

export async function hasReachedItemLimit(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ value: count() })
    .from(items)
    .where(and(eq(items.userId, userId), eq(items.status, "active")));
  return Number(row?.value ?? 0) >= MAX_ITEMS_PER_USER;
}

export async function completeItem(
  itemId: number,
  userId: string,
  action: ItemAction
) {
  return db.transaction(async (tx) => {
    const [item] = await tx
      .update(items)
      .set({ status: action, updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(items.id, itemId),
          eq(items.userId, userId),
          eq(items.status, "active")
        )
      )
      .returning({
        id: items.id,
        name: items.name,
        quantity: items.quantity,
        unit: items.unit,
        costEstimate: items.costEstimate,
      });

    if (!item) {
      const [existing] = await tx
        .select({ status: items.status })
        .from(items)
        .where(and(eq(items.id, itemId), eq(items.userId, userId)))
        .limit(1);

      if (!existing) {
        return { status: 404, body: { error: "Item not found." } };
      }

      return {
        status: 409,
        body: { error: `Item is already marked as ${existing.status}.` },
      };
    }

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
      .limit(1)
      .for("update");

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
