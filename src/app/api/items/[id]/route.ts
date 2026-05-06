import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/session";
import {
  categoryExists,
  parseItemId,
  validatePatchItemPayload,
} from "../_lib";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
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
    .where(and(eq(items.id, itemId), eq(items.userId, userId)))
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
  const userId = await getCurrentUserId();
  const { id } = await params;
  const itemId = parseItemId(id);
  if (itemId === null) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  const existing = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.userId, userId)))
    .get();

  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await db
    .delete(items)
    .where(and(eq(items.id, itemId), eq(items.userId, userId)))
    .run();

  return NextResponse.json({ success: true });
}
