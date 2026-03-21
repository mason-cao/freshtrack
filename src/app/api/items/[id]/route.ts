import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updated = db
    .update(items)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(items.id, parseInt(id)))
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

  db.delete(items).where(eq(items.id, parseInt(id))).run();

  return NextResponse.json({ success: true });
}
