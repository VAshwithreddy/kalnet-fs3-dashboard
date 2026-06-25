"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityItem {
  name: string;
  active: number;
  new: number;
}

const getStartAndEndOfWeek = (offsetWeeks: number) => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + offsetWeeks * 7);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { monday, sunday };
};

const getWeekRangeLabel = (monday: Date, sunday: Date, offset: number) => {
  const optionsShort: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const optionsWithYear: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  
  const startStr = monday.toLocaleDateString('en-US', optionsShort);
  const endStr = sunday.toLocaleDateString('en-US', monday.getFullYear() === sunday.getFullYear() ? optionsShort : optionsWithYear);
  
  const prefix = offset === 0 ? "This Week (" : offset === -1 ? "Last Week (" : "";
  const suffix = prefix ? ")" : `, ${sunday.getFullYear()}`;
  
  return `${prefix}${startStr} - ${endStr}${suffix}`;
};

export function ActivityChart() {
  const [chartData, setChartData] = useState<ActivityItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const { monday, sunday } = getStartAndEndOfWeek(weekOffset);

  useEffect(() => {
    setMounted(true);
    async function fetchActivity() {
      try {
        const { monday: start, sunday: end } = getStartAndEndOfWeek(weekOffset);
        const res = await fetch(
          `/api/reports?type=activity&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
        );
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

          const formatted = daysOfWeek.map((day, index) => {
            const dateObj = new Date(start);
            dateObj.setDate(start.getDate() + index);
            const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // e.g. "Jun 22"
            return {
              name: `${day} (${dateLabel})`,
              active: dayMap[day].active,
              new: dayMap[day].new
            };
          });

          setChartData(formatted);
        }
      } catch (e) {
        console.error("Failed to fetch activity chart:", e);
      }
    }
    fetchActivity();
  }, [weekOffset]);

  return (
    <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl h-80 w-full mt-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-text-heading font-semibold">Weekly Activity</div>
          <div className="text-xs text-text-muted mt-0.5">
            {getWeekRangeLabel(monday, sunday, weekOffset)}
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-bg-app border border-border p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-1 hover:bg-bg-card-hover rounded-lg text-text-secondary hover:text-text-heading transition-colors cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => setWeekOffset(prev => prev + 1)}
            disabled={weekOffset >= 0}
            className="p-1 hover:bg-bg-card-hover rounded-lg text-text-secondary hover:text-text-heading transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {mounted ? (
        <ResponsiveContainer width="100%" height="80%">
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
        <div className="h-[80%] w-full flex items-center justify-center text-text-secondary text-sm">Loading Chart...</div>
      )}
    </div>
  );
}
