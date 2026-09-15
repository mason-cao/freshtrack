import type { PantryCategory } from "@/lib/pantry";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";

export async function GET() {
  const result = await db.select().from(categories);
  return NextResponse.json(result satisfies PantryCategory[]);
}
