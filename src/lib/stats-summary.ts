import { formatMonthLabel } from "@/lib/dates";

interface MonthlyData {
  consumed: number;
  wasted: number;
  consumedCost: number;
  wastedCost: number;
}

export interface StatsAggregateRow {
  month: string;
  action: "consumed" | "wasted";
  itemCount: number | string | null;
  costTotal: number | string | null;
}

function numberValue(value: number | string | null): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

export function buildStatsSummary(rows: StatsAggregateRow[]) {
  const monthlyMap = new Map<string, MonthlyData>();

  for (const row of rows) {
    const data =
      monthlyMap.get(row.month) ??
      {
        consumed: 0,
        wasted: 0,
        consumedCost: 0,
        wastedCost: 0,
      };

    const itemCount = numberValue(row.itemCount);
    const costTotal = numberValue(row.costTotal);

    if (row.action === "consumed") {
      data.consumed += itemCount;
      data.consumedCost += costTotal;
    } else {
      data.wasted += itemCount;
      data.wastedCost += costTotal;
    }

    monthlyMap.set(row.month, data);
  }

  const monthly = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      monthLabel: formatMonthLabel(month),
      ...data,
    }));

  const totals = monthly.reduce(
    (current, month) => ({
      consumed: current.consumed + month.consumed,
      wasted: current.wasted + month.wasted,
      consumedCost: current.consumedCost + month.consumedCost,
      wastedCost: current.wastedCost + month.wastedCost,
    }),
    { consumed: 0, wasted: 0, consumedCost: 0, wastedCost: 0 }
  );

  const totalActions = totals.consumed + totals.wasted;
  const wasteRate =
    totalActions > 0 ? Math.round((totals.wasted / totalActions) * 100) : 0;

  return {
    monthly,
    totals: {
      ...totals,
      wasteRate,
      moneySaved: totals.consumedCost,
    },
  };
}
