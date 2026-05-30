"use client";

import React, { useState, useEffect } from "react";
import { MetricCard } from "@/components/MetricCard";
import { 
  GraduationCap, 
  UserCheck, 
  CalendarOff, 
  BookOpen, 
  FileEdit, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  X,
  Loader2,
  Bell
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

interface ScheduleItem {
  id: number;
  subject: string;
  grade: string;
  time: string;
  room: string;
  active: boolean;
}

interface TeacherData {
  totalStudents: number;
  pendingLeavesCount: number;
  leaveRequests: LeaveRequest[];
  activeClasses: number;
  averageAttendance: number;
  pendingGrading: number;
  upcomingExams: number;
  schedule: ScheduleItem[];
}

export default function TeacherDashboard() {
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Action state (for button spinners)
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/teacher/stats");
      if (res.ok) {
        const stats = await res.json();
        setData(stats);
      } else {
        setError("Failed to fetch teacher portal data.");
      }
    } catch (e) {
      console.error(e);
      setError("A network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateLeaveStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
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
      // Refresh statistics & table
      await fetchDashboardData();
    } catch (e: unknown) {
      showNotification("error", e instanceof Error ? e.message : "Error updating leave request");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <span className="text-sm text-text-secondary">Loading your workspace...</span>
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
            onClick={() => { setLoading(true); fetchDashboardData(); }}
            className="mt-4 px-4 py-2 bg-bg-app border border-border rounded-lg text-text-heading hover:bg-bg-input transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const pendingLeavesList = data?.leaveRequests.filter(req => req.status === "PENDING") || [];

  const metrics = [
    { title: "Total Students", value: data ? data.totalStudents.toString() : "0", trend: "+2", trendUp: true, icon: GraduationCap, sparklineData: [80, 82, 82, 84, 84, 85, 86] },
    { title: "My Classes", value: data ? data.activeClasses.toString() : "0", trend: "0", trendUp: true, icon: BookOpen, sparklineData: [4, 4, 4, 4, 4, 4, 4] }, 
    { title: "Attendance Rate", value: data ? `${data.averageAttendance}%` : "0%", trend: "+0.4%", trendUp: true, icon: UserCheck, sparklineData: [95.1, 95.3, 95.0, 95.4, 95.6, 95.8, 95.8] },
    { title: "Pending Leaves", value: data ? data.pendingLeavesCount.toString() : "0", trend: pendingLeavesList.length > 0 ? `+${pendingLeavesList.length}` : "0", trendUp: false, icon: CalendarOff, sparklineData: [3, 2, 4, 3, 2, 5, pendingLeavesList.length] },
    { title: "Pending Grading", value: data ? data.pendingGrading.toString() : "0", trend: "-8", trendUp: true, icon: FileEdit, sparklineData: [32, 28, 25, 20, 18, 15, 12] },
    { title: "Upcoming Exams", value: data ? data.upcomingExams.toString() : "0", trend: "Next: Wed", trendUp: true, icon: Calendar, sparklineData: [1, 2, 1, 3, 2, 2, 2] },
  ];

  // Recharts Chart Data: Attendance Rate per Class
  const attendanceChartData = [
    { className: "Grade 10-A", rate: 96.5 },
    { className: "Grade 11-B", rate: 94.2 },
    { className: "Grade 9-A", rate: 95.8 },
    { className: "Grade 12-C", rate: 96.9 }
  ];

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
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">Classroom Overview</h1>
          <p className="text-text-secondary mt-2">Manage your current classes, schedules, and student requests.</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
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

      {/* Timetable and Attendance chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Timetable component */}
        <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl flex flex-col transition-all duration-300 hover:shadow-shadow-elevated hover:bg-bg-card-hover">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <div className="text-text-heading font-semibold">Today's Schedule</div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {data?.schedule.map((item) => (
              <div 
                key={item.id} 
                className={`p-3.5 border rounded-xl transition-all ${
                  item.active 
                    ? "bg-primary-ghost/40 border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]" 
                    : "bg-bg-app border-border"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold text-text-heading">{item.subject}</div>
                    <div className="text-xs text-text-secondary mt-0.5">{item.grade} · {item.room}</div>
                  </div>
                  {item.active && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/25 text-violet-400 border border-violet-500/30 uppercase tracking-wider animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-muted mt-2.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Rates Chart */}
        <div className="lg:col-span-2 bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl transition-all duration-300 hover:shadow-shadow-elevated hover:bg-bg-card-hover">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="text-text-heading font-semibold">Attendance Rate by Class</div>
              <p className="text-xs text-text-secondary mt-1">Average daily attendance rate for active classes.</p>
            </div>
            <div className="text-xs text-text-muted">Target: 95.0%</div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="className" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis domain={[90, 100]} stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#13151A", borderColor: "#1F2937", borderRadius: "12px" }}
                  labelStyle={{ color: "#E5E7EB", fontWeight: "bold" }}
                  itemStyle={{ color: "#A78BFA" }}
                  formatter={(value: any) => [`${value}%`, "Attendance"]}
                />
                <Bar dataKey="rate" radius={[8, 8, 0, 0]} maxBarSize={45}>
                  {attendanceChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.rate >= 95 ? "url(#colorSuccess)" : "url(#colorWarning)"} 
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-green)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--color-green)" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D97706" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#D97706" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leave Requests Desk */}
      <div className="bg-bg-card border border-border shadow-shadow-card p-6 rounded-2xl mt-6 transition-all duration-300 hover:shadow-shadow-elevated hover:bg-bg-card-hover">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-text-heading font-semibold">Student Leave Requests</div>
            <p className="text-xs text-text-secondary mt-1">Pending leaves requiring teacher approval or rejection.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
            {pendingLeavesList.length} Action Needed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-sm text-text-secondary">
                <th className="pb-3 font-medium">Student Name</th>
                <th className="pb-3 font-medium">Admission No</th>
                <th className="pb-3 font-medium">Date Range</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pendingLeavesList.map((item) => (
                <tr key={item.id} className="border-b border-border/40 last:border-0 hover:bg-bg-app/40 transition-colors">
                  <td className="py-4 text-text-heading font-medium">
                    {item.student.firstName} {item.student.lastName}
                  </td>
                  <td className="py-4 text-text-heading">
                    {item.student.admissionNo || '-'}
                  </td>
                  <td className="py-4 text-text-secondary">
                    {new Date(item.fromDate).toLocaleDateString()} – {new Date(item.toDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-text-muted max-w-xs truncate" title={item.reason || ""}>
                    {item.reason || "No reason provided"}
                  </td>
                  <td className="py-4 text-right">
                    {processingId === item.id ? (
                      <div className="flex justify-end pr-8">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateLeaveStatus(item.id, "APPROVED")}
                          className="p-1.5 bg-green/10 text-green border border-green/20 rounded-lg hover:bg-green hover:text-white transition-all hover:scale-105 shadow-sm"
                          title="Approve Leave"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateLeaveStatus(item.id, "REJECTED")}
                          className="p-1.5 bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger hover:text-white transition-all hover:scale-105 shadow-sm"
                          title="Reject Leave"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {pendingLeavesList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-secondary">
                    <CheckCircle2 className="w-8 h-8 text-green/60 mx-auto mb-2" />
                    All student leave requests are cleared!
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
