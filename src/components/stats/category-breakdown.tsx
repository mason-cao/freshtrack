"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthlyData {
  monthLabel: string;
  consumedCost: number;
  wastedCost: number;
}

interface CategoryBreakdownProps {
  data: MonthlyData[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <div className="h-[300px] min-w-0 xl:h-[420px] 2xl:h-[500px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          barGap={8}
          barCategoryGap="24%"
        >
          <CartesianGrid vertical={false} stroke="#e6dcc4" />
          <XAxis
            dataKey="monthLabel"
            axisLine={false}
            fontSize={12}
            tickLine={false}
            stroke="#78716c"
          />
          <YAxis
            axisLine={false}
            fontSize={12}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            stroke="#78716c"
          />
          <Tooltip
            cursor={{ fill: "#f3ead8" }}
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e6dcc4",
              boxShadow: "0 14px 40px rgba(120, 95, 50, 0.14)",
              background: "#fffdf7",
            }}
          />
          <Bar
            dataKey="consumedCost"
            name="Consumed Value"
            fill="#527a52"
            radius={[8, 8, 2, 2]}
          />
          <Bar
            dataKey="wastedCost"
            name="Wasted Value"
            fill="#c2410c"
            radius={[8, 8, 2, 2]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
