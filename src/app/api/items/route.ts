import type { PantryItem } from "@/lib/pantry";
import { categoryExists, hasReachedItemLimit } from "@/db/items";
import { isItemStatus, validateCreateItemPayload } from "@/lib/item-validation";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, categories } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/session";
import {
  authorizeItemMutation,
  readJsonRequestBody,
} from "./_lib";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") || "active";

  if (!isItemStatus(status)) {
    return NextResponse.json(
      { error: "Status must be active, consumed, or wasted." },
      { status: 400 }
    );
  }

  const result = await db
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
    .where(and(eq(items.status, status), eq(items.userId, userId)))
    .orderBy(asc(items.expirationDate));

  return NextResponse.json(result satisfies PantryItem[]);
}

export async function POST(request: NextRequest) {
  const access = await authorizeItemMutation(request, true);
  if (!access.ok) return access.response;
  const { userId } = access;

  const bodyResult = await readJsonRequestBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status }
    );
  }

  const validation = validateCreateItemPayload(bodyResult.body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (await hasReachedItemLimit(userId)) {
    return NextResponse.json(
      { error: "Item limit reached. Delete old items before adding more." },
      { status: 409 }
    );
  }

  if (
    validation.data.categoryId !== null &&
    !(await categoryExists(validation.data.categoryId))
  ) {
    return NextResponse.json({ error: "Category not found." }, { status: 400 });
  }

  const [newItem] = await db
    .insert(items)
    .values({
      ...validation.data,
      userId,
      status: "active",
    })
    .returning();

  return NextResponse.json(newItem, { status: 201 });
}
