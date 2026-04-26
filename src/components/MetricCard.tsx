"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
}

export function MetricCard({ title, value, trend, trendUp, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-bg-card shadow-shadow-card border border-border p-6 rounded-2xl flex flex-col justify-between h-40 transition-shadow hover:shadow-shadow-elevated hover:bg-bg-card-hover">
      <div className="flex justify-between items-start">
        <div className="text-text-secondary text-sm font-medium">{title}</div>
        <div className="p-2 bg-primary-ghost rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-text-heading mb-1">{value}</div>
        <div className="flex items-center text-sm">
          <span className={trendUp ? "text-green font-medium" : "text-danger font-medium"}>
            {trend}
          </span>
          <span className="text-text-muted ml-2">vs last month</span>
        </div>
      </div>
    </div>
  );
}
