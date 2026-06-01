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
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { toast } from "sonner";

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
  
  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    leaveId: number;
    status: "APPROVED" | "REJECTED";
    studentName: string;
  } | null>(null);

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
      setError("A network/server error occurred.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleOpenConfirm = (id: number, status: "APPROVED" | "REJECTED", studentName: string) => {
    setConfirmModal({
      isOpen: true,
      leaveId: id,
      status,
      studentName
    });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!confirmModal) return;
    const { leaveId, status } = confirmModal;
    setConfirmModal(null);
    setProcessingId(leaveId);

    try {
      const res = await fetch("/api/teacher/leaves", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leaveId, status })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update status");
      }

      toast.success(`Leave request successfully ${status.toLowerCase()}!`);
      await fetchLeaves();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error updating status");
    } finally {
      setProcessingId(null);
    }
  };

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

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="bg-danger/10 border border-danger/20 p-6 rounded-2xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
          <div className="text-lg font-semibold text-danger mb-2">Error Loading Leaves</div>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button 
            onClick={() => { setLoading(true); setError(null); fetchLeaves(); }}
            className="px-4 py-2 bg-bg-app border border-border rounded-lg text-text-heading hover:bg-bg-input transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 relative">
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
        {loading ? (
          <TableSkeleton columns={6} rows={5} />
        ) : filteredLeaves.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={
              activeFilter === "PENDING"
                ? "No pending leaves. Great job! ✨"
                : "No leave requests found"
            }
            description={
              activeFilter === "PENDING"
                ? "All submitted student leave applications have been fully processed."
                : "There are currently no leaves in this filter state."
            }
          />
        ) : (
          <div className="overflow-x-auto animate-in fade-in duration-300">
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
                              onClick={() => handleOpenConfirm(item.id, "APPROVED", `${item.student.firstName} ${item.student.lastName}`)}
                              className="p-1.5 bg-green/10 text-green border border-green/20 rounded-lg hover:bg-green hover:text-white transition-all hover:scale-105 shadow-sm cursor-pointer"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenConfirm(item.id, "REJECTED", `${item.student.firstName} ${item.student.lastName}`)}
                              className="p-1.5 bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger hover:text-white transition-all hover:scale-105 shadow-sm cursor-pointer"
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
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.status === "APPROVED" ? "Approve Leave Request" : "Reject Leave Request"}
          message={`Are you sure you want to ${confirmModal.status.toLowerCase()} the leave request for ${confirmModal.studentName}? This action cannot be undone.`}
          confirmLabel={confirmModal.status === "APPROVED" ? "Approve" : "Reject"}
          cancelLabel="Cancel"
          isDestructive={confirmModal.status === "REJECTED"}
          onConfirm={handleConfirmStatusUpdate}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

