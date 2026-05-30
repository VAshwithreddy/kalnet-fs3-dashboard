"use client";

import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartItem {
  month: string;
  admissions: number;
  fees: number;
}

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
          const data = await res.json();
          // The backend returns an array of objects: { month, admissions, feeCollected }
          const formattedData = data.map((item: { month: string; admissions: number; feeCollected: number }) => ({
            month: item.month,
            admissions: item.admissions,
            fees: item.feeCollected
          }));
          
          setChartData(formattedData);
        }
      } catch (e) {
        console.error("Failed to fetch charts", e);
      }
    }
    fetchCharts();
  }, []);

  return (
    <div className="bg-bg-card border border-border flex flex-col p-6 rounded-2xl h-80 w-full mt-6 shadow-shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-shadow-elevated hover:bg-bg-card-hover mb-6 lg:mb-0">
      <div className="text-text-heading font-semibold mb-4 text-left ml-4">Admissions vs Pending Fees (Monthly)</div>
      {mounted ? (
        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="month" stroke="var(--chart-axis)" axisLine={false} tickLine={false} />
            <YAxis 
              yAxisId="left" 
              stroke="var(--chart-axis)" 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => `${value}`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="var(--chart-axis)" 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-tooltip)', border: 'none', borderRadius: '8px', color: 'var(--text-on-primary)' }}
              itemStyle={{ color: 'var(--text-on-primary)' }}
              formatter={(value, name) => {
                if (name === 'Pending Fees') return [`$${Number(value).toLocaleString()}`, 'Pending Fees'];
                return [value, 'Admissions'];
              }}
            />
            <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
            <Bar yAxisId="left" dataKey="admissions" barSize={20} fill="var(--chart-line-1)" name="Admissions" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="fees" stroke="var(--chart-line-2, #0f172a)" strokeWidth={3} dot={{ r: 4, fill: 'var(--chart-line-2, #0f172a)' }} connectNulls name="Pending Fees" />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">Loading Chart...</div>
      )}
    </div>
  );
}
