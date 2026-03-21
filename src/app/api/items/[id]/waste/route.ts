import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, wasteLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseInt(id);

  const item = db.select().from(items).where(eq(items.id, itemId)).get();
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  db.update(items)
    .set({ status: "wasted", updatedAt: new Date().toISOString() })
    .where(eq(items.id, itemId))
    .run();

  db.insert(wasteLog)
    .values({
      itemId: item.id,
      itemName: item.name,
      action: "wasted",
      quantity: item.quantity,
      unit: item.unit,
      costEstimate: item.costEstimate,
    })
    .run();

  return NextResponse.json({ success: true });
}
