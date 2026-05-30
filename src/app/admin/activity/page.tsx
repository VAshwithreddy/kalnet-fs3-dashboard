"use client";

import React from "react";
import { ActivityChart } from "@/components/ActivityChart";
import { UserPlus, Settings, FileText, Download, ShieldAlert, CheckCircle2 } from "lucide-react";

const activities = [
  { id: 1, type: "user_added", user: "Admin", target: "Robert Smith", time: "2 hours ago", icon: UserPlus, color: "text-primary", bg: "bg-primary-ghost" },
  { id: 2, type: "report_generated", user: "Alice Johnson", target: "Q3 Financials", time: "5 hours ago", icon: FileText, color: "text-accent-teal", bg: "bg-accent-teal/10" },
  { id: 3, type: "settings_changed", user: "Admin", target: "Security Policies", time: "Yesterday", icon: Settings, color: "text-text-secondary", bg: "bg-bg-card-hover" },
  { id: 4, type: "export", user: "Mary Williams", target: "Student List CSV", time: "Yesterday", icon: Download, color: "text-green", bg: "bg-green-light" },
  { id: 5, type: "security_alert", user: "System", target: "Failed login attempt", time: "2 days ago", icon: ShieldAlert, color: "text-danger", bg: "bg-danger/10" },
  { id: 6, type: "approval", user: "Admin", target: "Leave Request #442", time: "3 days ago", icon: CheckCircle2, color: "text-green", bg: "bg-green-light" },
];

export default function ActivityPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">System Activity</h1>
          <p className="text-text-secondary mt-2">Monitor recent events, logins, and administrative actions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>

        {/* Right Column - Activity Feed */}
        <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl h-80 mt-6 lg:h-[360px] flex flex-col">
          <div className="text-text-heading font-semibold mb-6">Recent Events</div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Timeline connector */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-border-light"></div>
                  )}
                  
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg} ${activity.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 pb-1">
                    <p className="text-sm text-text-heading font-medium">
                      {activity.user} 
                      <span className="text-text-secondary font-normal mx-1">
                        {activity.type === "user_added" ? "added new user" :
                         activity.type === "report_generated" ? "generated report" :
                         activity.type === "settings_changed" ? "updated" :
                         activity.type === "export" ? "downloaded" :
                         activity.type === "security_alert" ? "detected" :
                         "approved"}
                      </span>
                      {activity.target}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
