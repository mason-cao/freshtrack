"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  month: string;
  monthLabel: string;
  consumed: number;
  wasted: number;
  consumedCost: number;
  wastedCost: number;
}

interface WasteChartProps {
  data: MonthlyData[];
}

export function WasteChart({ data }: WasteChartProps) {
  return (
    <div className="h-[300px] min-w-0 xl:h-[420px] 2xl:h-[500px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          barGap={8}
          barCategoryGap="24%"
        >
          <CartesianGrid vertical={false} stroke="#ebe5d8" />
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
            stroke="#78716c"
          />
          <Tooltip
            cursor={{ fill: "#f5f0e8" }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 32px rgba(180, 160, 120, 0.12)",
              background: "#faf8f5",
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Bar
            dataKey="consumed"
            name="Consumed"
            fill="#527a52"
            radius={[8, 8, 2, 2]}
          />
          <Bar
            dataKey="wasted"
            name="Wasted"
            fill="#c2410c"
            radius={[8, 8, 2, 2]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
