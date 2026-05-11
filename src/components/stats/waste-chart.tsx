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
            stroke="#78716c"
          />
          <Tooltip
            cursor={{ fill: "#f3ead8" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e6dcc4",
              boxShadow: "0 14px 40px rgba(120, 95, 50, 0.14)",
              background: "#fffdf7",
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
