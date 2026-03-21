import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") || "active";

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
    .where(eq(items.status, status as "active" | "consumed" | "wasted"))
    .orderBy(asc(items.expirationDate))
    .all();

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newItem = db
    .insert(items)
    .values({
      name: body.name,
      categoryId: body.categoryId,
      quantity: body.quantity || 1,
      unit: body.unit || "count",
      purchaseDate: body.purchaseDate || new Date().toISOString().split("T")[0],
      expirationDate: body.expirationDate,
      costEstimate: body.costEstimate || null,
      notes: body.notes || null,
      status: "active",
    })
    .returning()
    .get();

  return NextResponse.json(newItem, { status: 201 });
}
