"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  label: string;
  index: number;
  forecast?: number;
}

export function HealthTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="idx" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(199 89% 52%)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(199 89% 52%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="index"
          stroke="hsl(199 89% 52%)"
          strokeWidth={2}
          fill="url(#idx)"
          name="Health Index"
        />
        <Area
          type="monotone"
          dataKey="forecast"
          stroke="hsl(152 60% 45%)"
          strokeDasharray="5 5"
          strokeWidth={2}
          fill="transparent"
          name="Forecast"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
