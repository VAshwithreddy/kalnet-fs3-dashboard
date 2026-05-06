"use client";

import React, { PureComponent } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', active: 4000, new: 2400 },
  { name: 'Tue', active: 3000, new: 1398 },
  { name: 'Wed', active: 2000, new: 9800 },
  { name: 'Thu', active: 2780, new: 3908 },
  { name: 'Fri', active: 1890, new: 4800 },
  { name: 'Sat', active: 2390, new: 3800 },
  { name: 'Sun', active: 3490, new: 4300 },
];

export function ActivityChart() {
  return (
    <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl h-80 w-full mt-6">
      <div className="text-text-heading font-semibold mb-4">Weekly Activity</div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-line-1)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--chart-line-1)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-line-2)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--chart-line-2)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--chart-axis)" axisLine={false} tickLine={false} />
          <YAxis 
            stroke="var(--chart-axis)" 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-tooltip)', border: 'none', borderRadius: '8px', color: 'var(--text-on-primary)' }}
            itemStyle={{ color: 'var(--text-on-primary)' }}
          />
          <Area type="monotone" dataKey="active" stroke="var(--chart-line-1)" fillOpacity={1} fill="url(#colorActive)" />
          <Area type="monotone" dataKey="new" stroke="var(--chart-line-2)" fillOpacity={1} fill="url(#colorNew)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
