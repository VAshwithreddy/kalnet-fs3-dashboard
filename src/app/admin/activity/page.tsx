"use client";

import React, { useState, useEffect } from "react";
import { ActivityChart } from "@/components/ActivityChart";
import {
  UserPlus,
  Settings,
  FileText,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  Activity,
  Loader2
} from "lucide-react";

interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  meta: string | null;
  performedBy: number | null;
  createdAt: string;
}

// Map DB action → visual config
function getActivityConfig(log: AuditLog) {
  const action = log.action.toUpperCase();

  if (action.includes("CREATE_USER") || action.includes("ADD_USER")) {
    return { icon: UserPlus, color: "text-primary", bg: "bg-primary-ghost", label: "added new user" };
  }
  if (action.includes("UPDATE_USER") || action.includes("PATCH_USER")) {
    return { icon: Settings, color: "text-text-secondary", bg: "bg-bg-card-hover", label: "updated user" };
  }
  if (action.includes("LEAVE_APPROVED") || action.includes("APPROVED")) {
    return { icon: CheckCircle2, color: "text-green", bg: "bg-green/10", label: "approved request" };
  }
  if (action.includes("LEAVE_REJECTED") || action.includes("REJECTED")) {
    return { icon: XCircle, color: "text-danger", bg: "bg-danger/10", label: "rejected request" };
  }
  if (action.includes("ATTENDANCE") || action.includes("MARK")) {
    return { icon: ClipboardList, color: "text-accent-teal", bg: "bg-accent-teal/10", label: "marked attendance" };
  }
  if (action.includes("SECURITY") || action.includes("FAILED_LOGIN") || action.includes("ALERT")) {
    return { icon: ShieldAlert, color: "text-danger", bg: "bg-danger/10", label: "detected security event" };
  }
  if (action.includes("REPORT") || action.includes("EXPORT")) {
    return { icon: FileText, color: "text-accent-teal", bg: "bg-accent-teal/10", label: "generated report" };
  }
  if (action.includes("SETTINGS") || action.includes("CONFIG")) {
    return { icon: Settings, color: "text-text-secondary", bg: "bg-bg-card-hover", label: "changed settings" };
  }
  // Default
  return { icon: Activity, color: "text-primary", bg: "bg-primary-ghost", label: action.toLowerCase().replace(/_/g, " ") };
}

function getRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getEntityLabel(log: AuditLog) {
  const meta = (() => {
    try { return log.meta ? JSON.parse(log.meta) : null; } catch { return null; }
  })();

  if (meta?.studentName) return meta.studentName;
  if (meta?.name) return meta.name;
  return `${log.entity} #${log.entityId}`;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchLogs(isSilent = false) {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch("/api/activity");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        setError(null);
      } else {
        if (!isSilent) setError("Failed to load activity logs.");
      }
    } catch (e) {
      console.error(e);
      if (!isSilent) setError("A network error occurred.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
    // Poll every 5 seconds for real-time activity feed sync
    const interval = setInterval(() => fetchLogs(true), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">System Activity</h1>
          <p className="text-text-secondary mt-2">Monitor recent events, logins, and administrative actions.</p>
        </div>
        <button
          onClick={() => fetchLogs()}
          className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border text-text-secondary hover:text-text-heading hover:bg-bg-card-hover rounded-xl text-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>

        {/* Right Column - Activity Feed */}
        <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl flex flex-col max-h-[420px]">
          <div className="flex items-center justify-between mb-5">
            <div className="text-text-heading font-semibold">Recent Events</div>
            {!loading && logs.length > 0 && (
              <span className="text-xs text-text-muted bg-bg-app border border-border px-2 py-0.5 rounded-full">
                {logs.length} entries
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-danger">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm">{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
              <Activity className="w-8 h-8 text-text-muted" />
              <p className="text-sm text-text-secondary">No activity logs yet.</p>
              <p className="text-xs text-text-muted">Actions like user edits, leave approvals and attendance marking appear here.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-5">
              {logs.map((log, index) => {
                const config = getActivityConfig(log);
                const Icon = config.icon;
                const entityLabel = getEntityLabel(log);
                return (
                  <div key={log.id} className="relative flex gap-4">
                    {/* Timeline connector */}
                    {index !== logs.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-[-20px] w-0.5 bg-border-light" />
                    )}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pb-1 min-w-0">
                      <p className="text-sm text-text-heading font-medium leading-snug">
                        <span className="text-text-secondary font-normal">{config.label} </span>
                        <span className="truncate">{entityLabel}</span>
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{getRelativeTime(log.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
