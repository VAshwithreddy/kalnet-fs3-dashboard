"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityItem {
  name: string;
  active: number;
  new: number;
}

export function ActivityChart() {
  const [chartData, setChartData] = useState<ActivityItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    async function fetchActivity() {
      try {
        const res = await fetch("/api/reports?type=activity");
        if (res.ok) {
          const resData = await res.json();
          const logs = Array.isArray(resData)
            ? resData
            : (resData && resData.success && Array.isArray(resData.data) ? resData.data : []);

          const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const dayMap = Object.fromEntries(daysOfWeek.map(day => [day, { active: 0, new: 0 }]));

          logs.forEach((log: { createdAt: string; action: string }) => {
            const date = new Date(log.createdAt);
            const dayIndex = date.getDay();
            const dayName = daysOfWeek[(dayIndex + 6) % 7]; // Map Mon to 0, Sun to 6
            dayMap[dayName].active += 1;

            const actionLower = log.action.toLowerCase();
            if (
              actionLower.includes("create") || 
              actionLower.includes("add") || 
              actionLower.includes("update") || 
              actionLower.includes("post") || 
              actionLower.includes("migrate")
            ) {
              dayMap[dayName].new += 1;
            }
          });

          const formatted = daysOfWeek.map(day => ({
            name: day,
            active: dayMap[day].active,
            new: dayMap[day].new
          }));

          setChartData(formatted);
        }
      } catch (e) {
        console.error("Failed to fetch activity chart:", e);
      }
    }
    fetchActivity();
  }, []);

  return (
    <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl h-80 w-full mt-6">
      <div className="text-text-heading font-semibold mb-4">Weekly Activity</div>
      {mounted ? (
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart
            data={chartData}
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
      ) : (
        <div className="h-[90%] w-full flex items-center justify-center text-text-secondary text-sm">Loading Chart...</div>
      )}
    </div>
  );
}
