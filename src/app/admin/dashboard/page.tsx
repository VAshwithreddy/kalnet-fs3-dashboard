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
  ClipboardCheck,
  Check,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { MetricCardSkeleton } from "@/components/Skeletons";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { toast } from "sonner";

interface Approval {
  id: number;
  type: string;
  status: string;
  createdAt: string;
}

interface Admission {
  id: number;
  admittedAt: string;
  student: {
    admissionNo: string | null;
    firstName: string;
    lastName: string;
  };
}

interface DashboardStats {
  studentsEnrolled: number;
  approvalsPending: number;
  outstandingFees: number;
  newAdmissionsThisMonth: number;
  feesCollectedThisMonth: number;
  leavePending: number;
  totalStaff: number;
  latestApprovals?: Approval[];
  latestAdmissions?: Admission[];
}

interface ChartItem {
  month: string;
  admissions: number;
  feeCollected: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    approvalId: number;
    status: "APPROVED" | "REJECTED";
    approvalType: string;
  } | null>(null);

  async function fetchStats(isSilent = false) {
    if (!isSilent) setLoading(true);
    try {
      const [statsRes, chartRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/charts?months=7")
      ]);
      if (statsRes.ok && chartRes.ok) {
        const statsData = await statsRes.json();
        const chartResData = await chartRes.json();
        const chartDataList = Array.isArray(chartResData)
          ? chartResData
          : (chartResData && chartResData.success && Array.isArray(chartResData.data) ? chartResData.data : []);
        setStats(statsData);
        setChartData(chartDataList);
      } else {
        if (!isSilent) setError("Failed to load dashboard data.");
      }
    } catch (e) {
      console.error("Failed to fetch dashboard stats", e);
      if (!isSilent) setError("Network or server error occurred.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  const handleOpenConfirm = (id: number, status: "APPROVED" | "REJECTED", type: string) => {
    setConfirmModal({
      isOpen: true,
      approvalId: id,
      status,
      approvalType: type
    });
  };

  const handleConfirmApproval = async () => {
    if (!confirmModal) return;
    const { approvalId, status } = confirmModal;
    setConfirmModal(null);
    setProcessingId(approvalId);

    try {
      const res = await fetch("/api/dashboard/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: approvalId, status })
      });
      if (res.ok) {
        toast.success(`Request successfully ${status.toLowerCase()}!`);
        // Refresh stats
        await fetchStats();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update request");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error updating approval request");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    // Poll every 5 seconds to pick up changes from Prisma Studio or other sources
    const interval = setInterval(() => {
      fetchStats(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="bg-danger/10 border border-danger/20 p-6 rounded-2xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
          <div className="text-lg font-semibold text-danger mb-2">Error Loading Dashboard</div>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button 
            onClick={() => { setLoading(true); setError(null); fetchStats(); }}
            className="mt-4 px-4 py-2 bg-bg-app border border-border rounded-lg text-text-heading hover:bg-bg-input transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">School Overview</h1>
          <p className="text-text-secondary mt-2">Real-time statistics and administration metrics.</p>
        </div>
        
        {/* Metric Card Skeletons */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts & Tables Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-72 bg-bg-card border border-border p-6 rounded-2xl animate-pulse flex items-center justify-center text-text-secondary">
              Loading Chart...
            </div>
          </div>
          <div className="h-72 bg-bg-card border border-border p-6 rounded-2xl animate-pulse flex flex-col gap-3">
            <div className="h-5 w-32 bg-bg-card-hover/40 rounded" />
            <div className="h-10 bg-bg-card-hover/40 rounded-xl" />
            <div className="h-10 bg-bg-card-hover/40 rounded-xl" />
            <div className="h-10 bg-bg-card-hover/40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const getStudentsTrend = () => {
    if (!stats || chartData.length === 0) return [1000, 1020, 1015, 1030, 1045, 1060, 1080];
    const admissionsTrend = chartData.map(d => d.admissions);
    const trend = new Array(admissionsTrend.length);
    let current = stats.studentsEnrolled;
    for (let i = admissionsTrend.length - 1; i >= 0; i--) {
      trend[i] = current;
      current -= admissionsTrend[i];
    }
    return trend;
  };

  const getFeesTrend = () => {
    if (chartData.length === 0) return [5000, 4800, 4500, 4200, 4000, 3800, 3500];
    return chartData.map(d => d.feeCollected);
  };

  const getAdmissionsTrend = () => {
    if (chartData.length === 0) return [10, 15, 12, 20, 25, 30, 35];
    return chartData.map(d => d.admissions);
  };

  const getLeaveTrend = () => {
    const current = stats?.leavePending ?? 0;
    return [
      Math.max(0, current - 2),
      Math.max(0, current - 1),
      Math.max(0, current - 3),
      Math.max(0, current + 1),
      Math.max(0, current),
      Math.max(0, current - 1),
      current
    ];
  };

  const getApprovalsTrend = () => {
    const current = stats?.approvalsPending ?? 0;
    return [
      Math.max(0, current + 4),
      Math.max(0, current + 2),
      Math.max(0, current + 3),
      Math.max(0, current + 1),
      Math.max(0, current + 2),
      Math.max(0, current - 1),
      current
    ];
  };

  const metrics = [
    { title: "Total Students", value: stats ? stats.studentsEnrolled?.toLocaleString() : "-", trend: "+5.2%", trendUp: true, icon: GraduationCap, sparklineData: getStudentsTrend() },
    { title: "Active Staff", value: stats ? stats.totalStaff?.toLocaleString() : "-", trend: "0%", trendUp: true, icon: UserCheck, sparklineData: [stats?.totalStaff ?? 0, stats?.totalStaff ?? 0, stats?.totalStaff ?? 0, stats?.totalStaff ?? 0, stats?.totalStaff ?? 0, stats?.totalStaff ?? 0, stats?.totalStaff ?? 0] },
    { title: "Pending Fees", value: stats ? `$${stats.outstandingFees?.toLocaleString()}` : "-", trend: "-12.5%", trendUp: true, icon: BadgeDollarSign, sparklineData: getFeesTrend() },
    { title: "New Admissions", value: stats ? stats.newAdmissionsThisMonth?.toLocaleString() : "-", trend: "+14.0%", trendUp: true, icon: UserPlus, sparklineData: getAdmissionsTrend() },
    { title: "Leave Requests", value: stats ? stats.leavePending?.toString() : "-", trend: "+2", trendUp: false, icon: CalendarOff, sparklineData: getLeaveTrend() },
    { title: "Pending Approvals", value: stats ? stats.approvalsPending?.toString() : "-", trend: "-4", trendUp: true, icon: ClipboardCheck, sparklineData: getApprovalsTrend() },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">School Overview</h1>
          <p className="text-text-secondary mt-2">Real-time statistics and administration metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
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

      <div className="mt-6">
        <TrendChart />
      </div>

      <div className="mt-6">
        <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-shadow-elevated hover:bg-bg-card-hover">
          <div className="text-text-heading font-semibold mb-4">Latest Approvals</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-sm text-text-secondary">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats?.latestApprovals?.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-bg-app/50 transition-colors">
                    <td className="py-3 text-text-heading font-medium">{item.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'APPROVED' ? 'bg-success/10 text-success' : item.status === 'PENDING' ? 'bg-warning/10 text-warning animate-pulse' : 'bg-danger/10 text-danger'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-text-secondary">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      {item.status === "PENDING" ? (
                        processingId === item.id ? (
                          <div className="flex justify-end pr-4">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenConfirm(item.id, "APPROVED", item.type)}
                              className="p-1 bg-green/10 text-green border border-green/20 rounded-md hover:bg-green hover:text-white transition-all shadow-sm cursor-pointer"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenConfirm(item.id, "REJECTED", item.type)}
                              className="p-1 bg-danger/10 text-danger border border-danger/20 rounded-md hover:bg-danger hover:text-white transition-all shadow-sm cursor-pointer"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-text-muted pr-2">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!stats?.latestApprovals?.length && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-text-secondary">No recent approvals</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.status === "APPROVED" ? "Approve Administrative Request" : "Reject Administrative Request"}
          message={`Are you sure you want to ${confirmModal.status.toLowerCase()} the request for "${confirmModal.approvalType}"? This action cannot be undone.`}
          confirmLabel={confirmModal.status === "APPROVED" ? "Approve" : "Reject"}
          cancelLabel="Cancel"
          isDestructive={confirmModal.status === "REJECTED"}
          onConfirm={handleConfirmApproval}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

