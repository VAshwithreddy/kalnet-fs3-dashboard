"use client";

import React, { useState, useEffect } from "react";
import { 
  Send,
  AlertCircle,
  Loader2,
  ClipboardList,
  Sparkles,
  Check
} from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

interface ApprovalRequest {
  id: number;
  type: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [requestType, setRequestType] = useState("Leave Request");
  const [submitting, setSubmitting] = useState(false);

  // Leave fields
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  // Touched states for validation
  const [fromDateTouched, setFromDateTouched] = useState(false);
  const [toDateTouched, setToDateTouched] = useState(false);
  const [reasonTouched, setReasonTouched] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // Fetch Requests
  async function fetchRequests() {
    try {
      const res = await fetch("/api/teacher/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data || []);
      } else {
        setError("Failed to fetch your requests.");
      }
    } catch (e) {
      console.error(e);
      setError("A network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, []);

  // Real-time validations calculated dynamically on render
  const getValidationErrors = () => {
    const errors: { fromDate?: string; toDate?: string; reason?: string } = {};

    if (requestType === "Leave Request") {
      if (fromDateTouched && !fromDate) {
        errors.fromDate = "Start date is required.";
      }
      
      if (toDateTouched && !toDate) {
        errors.toDate = "End date is required.";
      } else if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
        errors.toDate = "End date must be after start date.";
      }

      if (reasonTouched) {
        if (!reason) {
          errors.reason = "Reason is required.";
        } else if (reason.length < 10) {
          errors.reason = "Reason must be at least 10 characters.";
        } else if (reason.length > 100) {
          errors.reason = "Reason cannot exceed 100 characters.";
        }
      }
    }

    return errors;
  };

  const validationErrors = getValidationErrors();

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger validation for all inputs if Leave Request
    if (requestType === "Leave Request") {
      setFromDateTouched(true);
      setToDateTouched(true);
      setReasonTouched(true);

      const errors: { fromDate?: string; toDate?: string; reason?: string } = {};
      if (!fromDate) errors.fromDate = "Start date is required.";
      if (!toDate) {
        errors.toDate = "End date is required.";
      } else if (fromDate && new Date(toDate) < new Date(fromDate)) {
        errors.toDate = "End date must be after start date.";
      }
      if (!reason) {
        errors.reason = "Reason is required.";
      } else if (reason.length < 10) {
        errors.reason = "Reason must be at least 10 characters.";
      } else if (reason.length > 100) {
        errors.reason = "Reason cannot exceed 100 characters.";
      }

      if (Object.keys(errors).length > 0) {
        toast.error("Please fix form errors before submitting.");
        return;
      }
    }

    setSubmitting(true);

    // Format request type description to show leave details nicely
    const submissionType = requestType === "Leave Request"
      ? `Leave: ${reason.substring(0, 30)}${reason.length > 30 ? "..." : ""} (${fromDate} to ${toDate})`
      : requestType;

    try {
      const res = await fetch("/api/teacher/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: submissionType })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit request");
      }

      toast.success("Request submitted to administrator successfully!");
      
      // Reset fields
      setFromDate("");
      setToDate("");
      setReason("");
      setFromDateTouched(false);
      setToDateTouched(false);
      setReasonTouched(false);
      
      await fetchRequests();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    fetchRequests();
  };

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="bg-danger/10 border border-danger/20 p-6 rounded-2xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
          <div className="text-lg font-semibold text-danger mb-2">Failed to Load Requests</div>
          <p className="text-sm text-text-secondary mb-4">
            Connection failed. Check your internet and try again.
          </p>
          <button 
            onClick={retryFetch}
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
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">My Requests to Admin</h1>
          <p className="text-text-secondary mt-2">Submit administrative requests and track their status in real time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Submit Request Form */}
        <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl h-fit transition-all duration-300 hover:shadow-shadow-elevated hover:bg-bg-card-hover">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-text-heading font-semibold">New Approval Request</h2>
          </div>

          {/* Inline Error Summary */}
          {requestType === "Leave Request" && Object.keys(validationErrors).length > 0 && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs animate-in fade-in duration-200">
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Fix the following issues:</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5">
                {validationErrors.fromDate && (
                  <li>
                    <button type="button" onClick={() => document.getElementById("from-date-input")?.focus()} className="underline text-left">
                      From Date: {validationErrors.fromDate}
                    </button>
                  </li>
                )}
                {validationErrors.toDate && (
                  <li>
                    <button type="button" onClick={() => document.getElementById("to-date-input")?.focus()} className="underline text-left">
                      To Date: {validationErrors.toDate}
                    </button>
                  </li>
                )}
                {validationErrors.reason && (
                  <li>
                    <button type="button" onClick={() => document.getElementById("reason-input")?.focus()} className="underline text-left">
                      Reason: {validationErrors.reason}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-heading mb-2">Request Type</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full bg-bg-app border border-border rounded-lg px-4 py-2.5 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm"
              >
                <option value="Leave Request">Leave Request</option>
                <option value="Expense Claim">Expense Claim</option>
                <option value="Resource Order">Resource Order</option>
                <option value="Training Request">Training Request</option>
              </select>
            </div>

            {/* Dynamic Leave Request Fields */}
            {requestType === "Leave Request" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider mb-2">From Date</label>
                    <input
                      id="from-date-input"
                      type="date"
                      min={todayStr}
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        setFromDateTouched(true);
                      }}
                      onBlur={() => setFromDateTouched(true)}
                      className={`w-full bg-bg-app border rounded-lg px-3 py-2 text-text-heading focus:outline-none focus:ring-1 text-xs transition-all ${
                        validationErrors.fromDate
                          ? "border-danger focus:border-danger focus:ring-danger/50"
                          : fromDate
                          ? "border-green focus:border-green focus:ring-green/50"
                          : "border-border focus:border-primary focus:ring-primary/50"
                      }`}
                    />
                    {validationErrors.fromDate && (
                      <p className="mt-1 text-[10px] text-danger">{validationErrors.fromDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider mb-2">To Date</label>
                    <input
                      id="to-date-input"
                      type="date"
                      min={fromDate || todayStr}
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setToDateTouched(true);
                      }}
                      onBlur={() => setToDateTouched(true)}
                      className={`w-full bg-bg-app border rounded-lg px-3 py-2 text-text-heading focus:outline-none focus:ring-1 text-xs transition-all ${
                        validationErrors.toDate
                          ? "border-danger focus:border-danger focus:ring-danger/50"
                          : toDate && !validationErrors.toDate
                          ? "border-green focus:border-green focus:ring-green/50"
                          : "border-border focus:border-primary focus:ring-primary/50"
                      }`}
                    />
                    {validationErrors.toDate && (
                      <p className="mt-1 text-[10px] text-danger">{validationErrors.toDate}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider">Reason</label>
                    <span className={`text-[10px] ${reason.length < 10 ? "text-warning" : reason.length > 100 ? "text-danger" : "text-green"}`}>
                      {reason.length}/100 characters
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      id="reason-input"
                      rows={3}
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        setReasonTouched(true);
                      }}
                      onBlur={() => setReasonTouched(true)}
                      placeholder="Specify your reason for leave..."
                      className={`w-full bg-bg-app border rounded-lg px-3 py-2 text-text-heading focus:outline-none focus:ring-1 text-xs transition-all pr-8 ${
                        validationErrors.reason
                          ? "border-danger focus:border-danger focus:ring-danger/50"
                          : reason && reason.length >= 10 && reason.length <= 100
                          ? "border-green focus:border-green focus:ring-green/50"
                          : "border-border focus:border-primary focus:ring-primary/50"
                      }`}
                    />
                    {reason && reason.length >= 10 && reason.length <= 100 && (
                      <Check className="w-4 h-4 text-green absolute right-2.5 bottom-3" />
                    )}
                  </div>
                  {validationErrors.reason && (
                    <p className="mt-1 text-[10px] text-danger">{validationErrors.reason}</p>
                  )}
                  {reason && reason.length < 10 && (
                    <p className="mt-1 text-[10px] text-warning">Reason is too short (minimum 10 characters).</p>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-text-muted leading-relaxed">
              Once submitted, the administrator will review your request. Approved requests will reflect in your log list immediately.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-b from-violet-400 to-violet-600 hover:from-violet-500 hover:to-violet-700 text-text-on-primary rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(139,92,246,0.4)] transition-all font-medium border border-violet-700 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {submitting ? "Submitting..." : "Submit to Admin"}
            </button>
          </form>
        </div>

        {/* Requests Status Table */}
        <div className="xl:col-span-2 bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl transition-all duration-300 hover:shadow-shadow-elevated hover:bg-bg-card-hover">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h2 className="text-text-heading font-semibold">Request History</h2>
            </div>
            {!loading && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-bg-app text-text-secondary border border-border">
                {requests.length} Total
              </span>
            )}
          </div>

          {loading ? (
            <TableSkeleton columns={4} rows={5} />
          ) : requests.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No requests yet"
              description="Check back later or submit a new administrative request above."
            />
          ) : (
            <div className="overflow-x-auto animate-in fade-in duration-300">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-sm text-text-secondary">
                    <th className="pb-3 font-medium">Request Type</th>
                    <th className="pb-3 font-medium">Date Submitted</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Resolved Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {requests.map((item) => (
                    <tr key={item.id} className="border-b border-border/40 last:border-0 hover:bg-bg-app/40 transition-colors">
                      <td className="py-4 text-text-heading font-medium">
                        {item.type}
                      </td>
                      <td className="py-4 text-text-secondary">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'APPROVED' 
                            ? 'bg-success/10 text-success border border-success/20' 
                            : item.status === 'PENDING' 
                            ? 'bg-warning/10 text-warning border border-warning/20 animate-pulse' 
                            : 'bg-danger/10 text-danger border border-danger/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-text-secondary">
                        {item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

