"use client";

import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartItem {
  month: string;
  admissions: number;
  fees: number;
}

const formatXAxis = (tickItem: string) => {
  if (!tickItem) return "";
  const parts = tickItem.split("-");
  if (parts.length < 2) return tickItem;
  const year = parts[0];
  const month = parts[1];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mIndex = parseInt(month, 10) - 1;
  if (mIndex >= 0 && mIndex < 12) {
    return `${monthNames[mIndex]} ${year.substring(2)}`;
  }
  return tickItem;
};

const formatYAxisRight = (value: number) => {
  if (value === 0) return "$0";
  return `$${Math.round(value / 1000)}k`;
};

export function TrendChart() {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    async function fetchCharts() {
      try {
        const res = await fetch("/api/dashboard/charts?months=6");
        if (res.ok) {
          const resData = await res.json();
          const data = Array.isArray(resData)
            ? resData
            : (resData && resData.success && Array.isArray(resData.data) ? resData.data : []);
          
          // The backend returns an array of objects: { month, admissions, feeCollected }
          const formattedData = data.map((item: { month: string; admissions: any; feeCollected: any }) => ({
            month: item.month,
            admissions: Number(item.admissions) || 0,
            fees: Number(item.feeCollected) || 0
          }));
          
          setChartData(formattedData);
        }
      } catch (e) {
        console.error("Failed to fetch charts", e);
      }
    }
    fetchCharts();
  }, []);

  console.log("TrendChart chartData:", chartData);

  return (
      <div className="bg-bg-card border border-border flex flex-col p-6 rounded-2xl h-80 w-full mt-6 shadow-shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-shadow-elevated hover:bg-bg-card-hover mb-6 lg:mb-0">
        <div className="text-text-heading font-semibold mb-4 text-left ml-4">Admissions vs Pending Fees (Monthly)</div>
        {mounted ? (
          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 40,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" stroke="var(--chart-axis)" axisLine={false} tickLine={false} tickFormatter={formatXAxis} />
              <YAxis 
                yAxisId="left"
                stroke="var(--chart-axis)" 
                axisLine={false} 
                tickLine={false} 
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                hide={true}
                domain={[0, 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-tooltip)', border: 'none', borderRadius: '8px', color: 'var(--text-on-primary)' }}
                itemStyle={{ color: 'var(--text-on-primary)' }}
                formatter={(value, name) => {
                  if (name === 'Pending Fees') return [`$${Number(value).toLocaleString()}`, 'Pending Fees'];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
              <Bar yAxisId="left" dataKey="admissions" barSize={20} fill="#2563eb" name="Admissions" isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="admissions" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, fill: '#0f172a' }} name="Admissions Trend" isAnimationActive={false} />
              <Line yAxisId="right" dataKey="fees" stroke="#16a34a" strokeWidth={0} dot={false} activeDot={false} name="Pending Fees" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">Loading Chart...</div>
      )}
    </div>
  );
}
