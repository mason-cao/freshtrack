import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  categoryExists,
  isItemStatus,
  validateCreateItemPayload,
} from "./_lib";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") || "active";

  if (!isItemStatus(status)) {
    return NextResponse.json(
      { error: "Status must be active, consumed, or wasted." },
      { status: 400 }
    );
  }

  const result = db
    .select({
      id: items.id,
      name: items.name,
      categoryId: items.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      quantity: items.quantity,
      unit: items.unit,
      purchaseDate: items.purchaseDate,
      expirationDate: items.expirationDate,
      status: items.status,
      costEstimate: items.costEstimate,
      notes: items.notes,
      createdAt: items.createdAt,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .where(eq(items.status, status))
    .orderBy(asc(items.expirationDate))
    .all();

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateCreateItemPayload(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (
    validation.data.categoryId !== null &&
    !categoryExists(validation.data.categoryId)
  ) {
    return NextResponse.json({ error: "Category not found." }, { status: 400 });
  }

  const newItem = db
    .insert(items)
    .values({
      ...validation.data,
      status: "active",
    })
    .returning()
    .get();

  return NextResponse.json(newItem, { status: 201 });
}
