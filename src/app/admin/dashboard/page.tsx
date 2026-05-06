"use client";

import React, { useState, useEffect } from "react";
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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="text-xl font-semibold text-danger">{error}</div>
      </div>
    );
  }

  const metrics = [
    { title: "Total Students", value: stats ? stats.studentsEnrolled?.toLocaleString() : "-", trend: "+5.2%", trendUp: true, icon: GraduationCap, sparklineData: [1000, 1020, 1015, 1030, 1045, 1060, 1080] },
    { title: "Active Staff", value: "124", trend: "0%", trendUp: true, icon: UserCheck, sparklineData: [120, 120, 121, 122, 124, 124, 124] }, 
    { title: "Pending Fees", value: stats ? `$${stats.outstandingFees?.toLocaleString()}` : "-", trend: "-12.5%", trendUp: true, icon: BadgeDollarSign, sparklineData: [5000, 4800, 4500, 4200, 4000, 3800, 3500] },
    { title: "New Admissions", value: stats ? stats.newAdmissionsThisMonth?.toLocaleString() : "-", trend: "+14.0%", trendUp: true, icon: UserPlus, sparklineData: [10, 15, 12, 20, 25, 30, 35] },
    { title: "Leave Requests", value: stats ? stats.leavePending?.toString() : "-", trend: "+2", trendUp: false, icon: CalendarOff, sparklineData: [2, 3, 2, 4, 5, 3, 6] },
    { title: "Pending Approvals", value: stats ? stats.approvalsPending?.toString() : "-", trend: "-4", trendUp: true, icon: ClipboardCheck, sparklineData: [20, 18, 15, 12, 10, 8, 6] },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">School Overview</h1>
          <p className="text-text-secondary mt-2">Real-time statistics and administration metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard 
            key={index}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            trendUp={metric.trendUp}
            icon={metric.icon}
            sparklineData={metric.sparklineData}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <TrendChart />
        </div>
        
        <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl mt-6 h-80 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-shadow-elevated hover:bg-bg-card-hover">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-shadow-elevated hover:bg-bg-card-hover">
          <div className="text-text-heading font-semibold mb-4">Latest Approvals</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-sm text-text-secondary">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats?.latestApprovals?.map((item: any) => (
                  <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-bg-app">
                    <td className="py-3 text-text-heading">{item.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'APPROVED' ? 'bg-success/10 text-success' : item.status === 'PENDING' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-text-secondary">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!stats?.latestApprovals?.length && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-text-secondary">No recent approvals</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-shadow-elevated hover:bg-bg-card-hover">
          <div className="text-text-heading font-semibold mb-4">Latest Admissions</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-sm text-text-secondary">
                  <th className="pb-3 font-medium">Admission No</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats?.latestAdmissions?.map((item: any) => (
                  <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-bg-app">
                    <td className="py-3 text-text-heading">{item.admissionNo || '-'}</td>
                    <td className="py-3 text-text-heading">{item.student?.firstName} {item.student?.lastName}</td>
                    <td className="py-3 text-text-secondary">{new Date(item.admittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!stats?.latestAdmissions?.length && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-text-secondary">No recent admissions</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
