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
    <div className="h-[300px] xl:h-[420px] 2xl:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ebe5d8" />
          <XAxis dataKey="monthLabel" fontSize={12} tickLine={false} stroke="#78716c" />
          <YAxis fontSize={12} tickLine={false} stroke="#78716c" />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 32px rgba(180, 160, 120, 0.12)",
              background: "#faf8f5",
            }}
          />
          <Legend />
          <Bar
            dataKey="consumed"
            name="Consumed"
            fill="#527a52"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="wasted"
            name="Wasted"
            fill="#c2410c"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
