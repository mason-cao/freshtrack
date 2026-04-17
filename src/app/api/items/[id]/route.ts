import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  categoryExists,
  parseItemId,
  validatePatchItemPayload,
} from "../_lib";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseItemId(id);
  if (itemId === null) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validatePatchItemPayload(body);
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

  const updated = await db
    .update(items)
    .set({ ...validation.data, updatedAt: new Date().toISOString() })
    .where(eq(items.id, itemId))
    .returning()
    .get();

  if (!updated) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseItemId(id);
  if (itemId === null) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  const existing = await db
    .select({ id: items.id })
    .from(items)
    .where(eq(items.id, itemId))
    .get();

  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await db.delete(items).where(eq(items.id, itemId)).run();

  return NextResponse.json({ success: true });
}
