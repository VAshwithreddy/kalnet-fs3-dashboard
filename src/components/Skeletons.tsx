"use client";

import React from "react";

// Helper component for shimmer pulse effect
export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-bg-card-hover/40 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent ${className}`} />
  );
}

// 1. MetricCardSkeleton matching MetricCard height/width
export function MetricCardSkeleton() {
  return (
    <div className="bg-bg-card border border-border p-6 rounded-2xl flex flex-col justify-between h-40 relative overflow-hidden">
      {/* Top section */}
      <div className="flex justify-between items-start">
        <Shimmer className="h-4.5 w-24" />
        <Shimmer className="h-9 w-9 rounded-lg" />
      </div>
      {/* Bottom section */}
      <div className="mt-4 flex justify-between items-end">
        <div className="space-y-2.5">
          <Shimmer className="h-8 w-16" />
          <Shimmer className="h-4 w-28" />
        </div>
        {/* Sparkline placeholder */}
        <Shimmer className="w-20 h-10 rounded-md" />
      </div>
    </div>
  );
}

// 2. TableSkeleton matching typical tables with header/rows/columns
interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export function TableSkeleton({ columns = 5, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {/* Table Header */}
      <div className="flex gap-4 border-b border-border pb-3.5 px-2">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1">
            <Shimmer className="h-4 w-3/4 max-w-[120px]" />
          </div>
        ))}
      </div>
      {/* Table Rows */}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 items-center border-b border-border/40 py-3.5 px-2 last:border-0">
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className="flex-1">
                <Shimmer className="h-5 w-5/6 max-w-[150px]" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. ChartSkeleton for dashboard charts
export function ChartSkeleton() {
  return (
    <div className="w-full h-60 bg-bg-card border border-border p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="h-3 w-64" />
        </div>
        <Shimmer className="h-4 w-24" />
      </div>
      
      {/* Mimic a bar/line chart layout with grid lines and columns */}
      <div className="flex-1 flex items-end gap-6 px-4 pb-2 border-b border-border/60 border-l border-border/60">
        <div className="flex-1 h-3/4 flex items-end justify-center"><Shimmer className="w-8 h-full rounded-t-lg" /></div>
        <div className="flex-1 h-1/2 flex items-end justify-center"><Shimmer className="w-8 h-full rounded-t-lg" /></div>
        <div className="flex-1 h-5/6 flex items-end justify-center"><Shimmer className="w-8 h-full rounded-t-lg" /></div>
        <div className="flex-1 h-2/3 flex items-end justify-center"><Shimmer className="w-8 h-full rounded-t-lg" /></div>
      </div>
    </div>
  );
}
