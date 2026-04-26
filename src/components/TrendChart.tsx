"use client";

import React, { PureComponent } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, CartesianAxis } from 'recharts';

const data = [
  { month: 'Jan', admissions: 120, fees: 45000 },
  { month: 'Feb', admissions: 98, fees: 38000 },
  { month: 'Mar', admissions: 150, fees: 55000 },
  { month: 'Apr', admissions: 130, fees: 48000 },
  { month: 'May', admissions: 110, fees: 42000 },
  { month: 'Jun', admissions: 170, fees: 65000 },
  { month: 'Jul', admissions: 90, fees: 31000 },
];

export function TrendChart() {
  return (
    <div className="bg-bg-card border border-border flex flex-col p-6 rounded-2xl h-80 w-full mt-6 shadow-shadow-card mb-6 lg:mb-0">
      <div className="text-text-heading font-semibold mb-4 text-left ml-4">Admissions vs Pending Fees (Monthly)</div>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          data={data}
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
