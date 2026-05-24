"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenuePoint = {
  month: string;
  revenue: number;
};

type RevenueChartProps = {
  data: RevenuePoint[];
};

export function RevenueChart({ data }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="panel p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow">Performance</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ink-strong)]">
            Revenue trend
          </h2>
        </div>
        <span className="rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-semibold text-[var(--success-strong)]">
          Stable growth
        </span>
      </div>
      <div className="h-72 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ef" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid rgba(148, 163, 184, 0.24)",
                }}
              />
              <Bar dataKey="revenue" fill="#0f766e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-end gap-3">
            {data.map((point) => (
              <div key={point.month} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className="w-full rounded-t-xl bg-teal-700/80"
                  style={{ height: `${point.revenue * 4}px` }}
                />
                <span className="text-xs text-[var(--ink-muted)]">{point.month}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
