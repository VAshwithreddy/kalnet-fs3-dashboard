"use client";

import React, { useState, useEffect } from "react";
import { 
  CalendarOff,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Loader2,
  Calendar,
  User,
  Filter
} from "lucide-react";

interface Student {
  admissionNo: string | null;
  firstName: string;
  lastName: string;
}

interface LeaveRequest {
  id: number;
  studentId: number;
  fromDate: string;
  toDate: string;
  reason: string | null;
  status: string;
  createdAt: string;
  student: Student;
}

export default function LeavesManagementPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  async function fetchLeaves() {
    try {
      const res = await fetch("/api/teacher/stats");
      if (res.ok) {
        const stats = await res.json();
        setLeaves(stats.leaveRequests || []);
      } else {
        setError("Failed to fetch leave requests.");
      }
    } catch (e) {
      console.error(e);
      setError("A network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/teacher/leaves", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update status");
      }

      showNotification("success", `Leave request successfully ${status.toLowerCase()}!`);
      await fetchLeaves();
    } catch (e: unknown) {
      showNotification("error", e instanceof Error ? e.message : "Error updating status");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <span className="text-sm text-text-secondary">Loading leave requests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="bg-danger/10 border border-danger/20 p-6 rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
          <div className="text-lg font-semibold text-danger">{error}</div>
          <button 
            onClick={() => { setLoading(true); fetchLeaves(); }}
            className="mt-4 px-4 py-2 bg-bg-app border border-border rounded-lg text-text-heading hover:bg-bg-input transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredLeaves = leaves.filter(req => {
    if (activeFilter === "ALL") return true;
    return req.status === activeFilter;
  });

  const counts = {
    ALL: leaves.length,
    PENDING: leaves.filter(r => r.status === "PENDING").length,
    APPROVED: leaves.filter(r => r.status === "APPROVED").length,
    REJECTED: leaves.filter(r => r.status === "REJECTED").length,
  };

  return (
    <div className="p-8 relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-xl shadow-shadow-elevated border animate-in fade-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-green/10 border-green/20 text-green' : 'bg-danger/10 border-danger/20 text-danger'}`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          <p className="font-medium text-sm">{notification.message}</p>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">Student Leaves</h1>
          <p className="text-text-secondary mt-2">View historical leaves and manage pending approvals.</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-border mb-6 overflow-x-auto gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeFilter === tab
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-heading"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeFilter === tab
                ? "bg-primary-ghost text-primary"
                : "bg-bg-card-hover text-text-muted"
            }`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Leave List Card */}
      <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl transition-all duration-300 hover:shadow-shadow-elevated hover:bg-bg-card-hover">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-sm text-text-secondary">
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Admission No</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredLeaves.map((item) => (
                <tr key={item.id} className="border-b border-border/40 last:border-0 hover:bg-bg-app/40 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-ghost flex items-center justify-center text-primary font-medium text-xs">
                        {item.student.firstName.charAt(0)}{item.student.lastName.charAt(0)}
                      </div>
                      <span className="text-text-heading font-medium">
                        {item.student.firstName} {item.student.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-text-heading">
                    {item.student.admissionNo || '-'}
                  </td>
                  <td className="py-4 text-text-secondary">
                    <div className="flex flex-col">
                      <span className="font-medium text-text-heading">
                        {new Date(item.fromDate).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-text-muted mt-0.5">
                        to {new Date(item.toDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-text-muted max-w-xs truncate" title={item.reason || ""}>
                    {item.reason || "No reason provided"}
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'APPROVED' 
                        ? 'bg-success/10 text-success border border-success/20' 
                        : item.status === 'PENDING' 
                        ? 'bg-warning/10 text-warning border border-warning/20' 
                        : 'bg-danger/10 text-danger border border-danger/20'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {item.status === "PENDING" ? (
                      processingId === item.id ? (
                        <div className="flex justify-end pr-8">
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                            className="p-1.5 bg-green/10 text-green border border-green/20 rounded-lg hover:bg-green hover:text-white transition-all hover:scale-105 shadow-sm"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                            className="p-1.5 bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger hover:text-white transition-all hover:scale-105 shadow-sm"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-text-muted pr-4">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary">
                    <Calendar className="w-10 h-10 text-text-muted mx-auto mb-2" />
                    No leave requests found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
