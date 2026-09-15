import { categoryExists } from "@/db/items";
import { parseItemId, validatePatchItemPayload } from "@/lib/item-validation";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import {
  authorizeItemMutation,
  readJsonRequestBody,
} from "../_lib";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await authorizeItemMutation(request, true);
  if (!access.ok) return access.response;
  const { userId } = access;

  const { id } = await params;
  const itemId = parseItemId(id);
  if (itemId === null) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  const bodyResult = await readJsonRequestBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status }
    );
  }

  const validation = validatePatchItemPayload(bodyResult.body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (
    validation.data.categoryId !== undefined &&
    validation.data.categoryId !== null &&
    !(await categoryExists(validation.data.categoryId))
  ) {
    return NextResponse.json({ error: "Category not found." }, { status: 400 });
  }

  const [updated] = await db
    .update(items)
    .set({ ...validation.data, updatedAt: new Date().toISOString() })
    .where(and(eq(items.id, itemId), eq(items.userId, userId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await authorizeItemMutation(request);
  if (!access.ok) return access.response;
  const { userId } = access;

  const { id } = await params;
  const itemId = parseItemId(id);
  if (itemId === null) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.userId, userId)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await db
    .delete(items)
    .where(and(eq(items.id, itemId), eq(items.userId, userId)));

  return NextResponse.json({ success: true });
}
