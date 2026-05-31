"use client";

import React, { useState, useEffect } from "react";
import { 
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ClipboardList,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";

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
  
  // Form state
  const [requestType, setRequestType] = useState("Leave Request");
  const [submitting, setSubmitting] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

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
    fetchRequests();
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: requestType })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit request");
      }

      showNotification("success", "Request submitted to administrator successfully!");
      setRequestType("Leave Request");
      await fetchRequests();
    } catch (e: unknown) {
      showNotification("error", e instanceof Error ? e.message : "Error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <span className="text-sm text-text-secondary">Loading requests...</span>
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
            onClick={() => { setLoading(true); fetchRequests(); }}
            className="mt-4 px-4 py-2 bg-bg-app border border-border rounded-lg text-text-heading hover:bg-bg-input transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-heading mb-2">Request Type</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full bg-bg-app border border-border rounded-lg px-4 py-2.5 text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
              >
                <option value="Leave Request">Leave Request</option>
                <option value="Expense Claim">Expense Claim</option>
                <option value="Resource Order">Resource Order</option>
                <option value="Training Request">Training Request</option>
              </select>
            </div>
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
            <span className="px-2 py-0.5 rounded-full text-xs bg-bg-app text-text-secondary border border-border">
              {requests.length} Total
            </span>
          </div>

          <div className="overflow-x-auto">
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
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-text-secondary">
                      <ClipboardList className="w-10 h-10 text-text-muted mx-auto mb-2" />
                      No submitted requests yet.
                    </td>
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
