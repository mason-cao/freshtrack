import { NextResponse } from "next/server";
import { db } from "@/db";
import { wasteLog } from "@/db/schema";
import { buildStatsSummary } from "@/lib/stats-summary";
import { count, eq, sql } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  const month = sql<string>`to_char(date_trunc('month', ${wasteLog.loggedAt}), 'YYYY-MM')`;
  const costTotal = sql<number>`coalesce(sum(${wasteLog.costEstimate}), 0)`;

  const rows = await db
    .select({
      month,
      action: wasteLog.action,
      itemCount: count(wasteLog.id),
      costTotal,
    })
    .from(wasteLog)
    .where(eq(wasteLog.userId, userId))
    .groupBy(month, wasteLog.action)
    .orderBy(month);

  return NextResponse.json(buildStatsSummary(rows));
}
