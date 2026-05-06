"use client";

import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function TrendChart() {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCharts() {
      try {
        const res = await fetch("/api/dashboard/charts?months=6");
        if (res.ok) {
          const data = await res.json();
          // Merge data
          const merged: Record<string, any> = {};
          
          data.admissionsMonthly?.forEach((item: any) => {
            merged[item.month] = { month: item.month, admissions: item.count, fees: 0 };
          });
          
          data.feeCollectionMonthly?.forEach((item: any) => {
            if (!merged[item.month]) {
              merged[item.month] = { month: item.month, admissions: 0, fees: 0 };
            }
            merged[item.month].fees = item.total;
          });
          
          setChartData(Object.values(merged));
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
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
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
            formatter={(value: any, name: any) => {
              if (name === 'fees') return [`$${Number(value).toLocaleString()}`, 'Pending Fees'];
              return [value, 'Admissions'];
            }}
          />
          <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
          <Bar yAxisId="left" dataKey="admissions" barSize={20} fill="var(--chart-line-1)" name="admissions" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="fees" stroke="var(--chart-line-2)" strokeWidth={3} dot={{ r: 4, fill: 'var(--chart-line-2)' }} name="fees" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
