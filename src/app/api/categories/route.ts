import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";

export async function GET() {
  const result = db.select().from(categories).all();
  return NextResponse.json(result);
}
