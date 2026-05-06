"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  sparklineData?: number[];
}

export function MetricCard({ title, value, trend, trendUp, icon: Icon, sparklineData }: MetricCardProps) {
  return (
    <div className="bg-bg-card shadow-shadow-card border border-border p-6 rounded-2xl flex flex-col justify-between h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-shadow-elevated hover:bg-bg-card-hover backdrop-blur-md">
      <div className="flex justify-between items-start">
        <div className="text-text-secondary text-sm font-medium">{title}</div>
        <div className="p-2 bg-primary-ghost rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-between items-end gap-x-2 gap-y-3">
        <div>
          <div className="text-2xl font-bold tracking-tight text-text-heading mb-1">{value}</div>
          <div className="flex items-center text-sm">
            <span className={trendUp ? "text-green font-medium shrink-0" : "text-danger font-medium shrink-0"}>
              {trend}
            </span>
            <span className="text-text-muted ml-2">vs last month</span>
          </div>
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-20 h-10 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData.map((val, i) => ({ val, i }))}>
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke={trendUp ? "var(--color-green)" : "var(--color-danger)"} 
                  strokeWidth={2} 
                  dot={false} 
                  isAnimationActive={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
