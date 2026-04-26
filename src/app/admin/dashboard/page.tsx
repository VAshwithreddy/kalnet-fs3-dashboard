"use client";

import React from "react";
import { MetricCard } from "@/components/MetricCard";
import { TrendChart } from "@/components/TrendChart";
import { 
  GraduationCap, 
  UserCheck, 
  BadgeDollarSign, 
  UserPlus, 
  CalendarOff, 
  ClipboardCheck 
} from "lucide-react";

export default function DashboardPage() {
  const metrics = [
    { title: "Total Students", value: "1,248", trend: "+5.2%", trendUp: true, icon: GraduationCap },
    { title: "Active Staff", value: "124", trend: "100%", trendUp: true, icon: UserCheck },
    { title: "Pending Fees", value: "$45,230", trend: "-12.5%", trendUp: true, icon: BadgeDollarSign },
    { title: "New Admissions", value: "48", trend: "+14.0%", trendUp: true, icon: UserPlus },
    { title: "Leave Requests", value: "14", trend: "+2", trendUp: false, icon: CalendarOff },
    { title: "Pending Approvals", value: "8", trend: "-4", trendUp: true, icon: ClipboardCheck },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">School Overview</h1>
          <p className="text-text-secondary mt-2">Real-time statistics and administration metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard 
            key={index}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            trendUp={metric.trendUp}
            icon={metric.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <TrendChart />
        </div>
        
        <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl mt-6 h-80 flex flex-col">
          <div className="text-text-heading font-semibold mb-4">Announcements</div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="p-3 bg-primary-ghost border border-primary-pale rounded-xl">
              <div className="text-sm font-medium text-text-heading mb-1">Staff Meeting Reminder</div>
              <div className="text-xs text-text-secondary">All teachers must attend the assembly hall at 3:00 PM today.</div>
            </div>
            <div className="p-3 bg-bg-app border border-border rounded-xl">
              <div className="text-sm font-medium text-text-heading mb-1">Q3 Fee Deadline</div>
              <div className="text-xs text-text-secondary">Please send a reminder out to parents regarding the upcoming fee deadline.</div>
            </div>
            <div className="p-3 bg-bg-app border border-border rounded-xl">
              <div className="text-sm font-medium text-text-heading mb-1">New Curriculum Guidelines</div>
              <div className="text-xs text-text-secondary">The state has issued new curriculum guidelines. Review in the portal.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
