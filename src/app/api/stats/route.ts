import { NextResponse } from "next/server";
import { db } from "@/db";
import { wasteLog } from "@/db/schema";

interface MonthlyData {
  consumed: number;
  wasted: number;
  consumedCost: number;
  wastedCost: number;
}

export async function GET() {
  const allLogs = db.select().from(wasteLog).all();

  // Aggregate by month
  const monthlyMap = new Map<string, MonthlyData>();

  for (const log of allLogs) {
    const date = new Date(log.loggedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        consumed: 0,
        wasted: 0,
        consumedCost: 0,
        wastedCost: 0,
      });
    }

    const data = monthlyMap.get(monthKey)!;
    if (log.action === "consumed") {
      data.consumed++;
      data.consumedCost += log.costEstimate || 0;
    } else {
      data.wasted++;
      data.wastedCost += log.costEstimate || 0;
    }
  }

  // Convert to sorted array
  const monthly = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      monthLabel: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      ...data,
    }));

  // Totals
  const totalConsumed = allLogs.filter((l) => l.action === "consumed").length;
  const totalWasted = allLogs.filter((l) => l.action === "wasted").length;
  const totalConsumedCost = allLogs
    .filter((l) => l.action === "consumed")
    .reduce((sum, l) => sum + (l.costEstimate || 0), 0);
  const totalWastedCost = allLogs
    .filter((l) => l.action === "wasted")
    .reduce((sum, l) => sum + (l.costEstimate || 0), 0);
  const wasteRate =
    totalConsumed + totalWasted > 0
      ? Math.round((totalWasted / (totalConsumed + totalWasted)) * 100)
      : 0;

  return NextResponse.json({
    monthly,
    totals: {
      consumed: totalConsumed,
      wasted: totalWasted,
      consumedCost: totalConsumedCost,
      wastedCost: totalWastedCost,
      wasteRate,
      moneySaved: totalConsumedCost,
    },
  });
}
