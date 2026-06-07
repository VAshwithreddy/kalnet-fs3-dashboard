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
  Search,
  Save,
  Users,
  CheckSquare
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MetricCardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/Skeletons";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

interface Student {
  admissionNo: string | null;
  firstName: string;
  lastName: string;
}

interface StudentDetail {
  id: number;
  admissionNo: string | null;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  attendanceStatus?: string | null;
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
  attendanceChartData: { className: string; rate: number }[];
}

export default function TeacherDashboard() {
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Action states
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    leaveId: number;
    status: "APPROVED" | "REJECTED";
    studentName: string;
  } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "attendance">("overview");

  // Student directory states
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Attendance states
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [attendanceStudents, setAttendanceStudents] = useState<StudentDetail[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceChanges, setAttendanceChanges] = useState<{ [studentId: number]: "PRESENT" | "ABSENT" | "LATE" }>({});
  const [isDirty, setIsDirty] = useState(false);
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState("");

  async function fetchDashboardData(isSilent = false) {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch("/api/teacher/stats");
      if (res.ok) {
        const stats = await res.json();
        setData(stats);
      } else {
        if (!isSilent) setError("Failed to fetch teacher portal data.");
      }
    } catch (e) {
      console.error(e);
      if (!isSilent) setError("A network/server error occurred.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  async function fetchStudents(isSilent = false) {
    if (!isSilent) setStudentsLoading(true);
    setStudentsError(null);
    try {
      const res = await fetch("/api/teacher/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        if (!isSilent) setStudentsError("Failed to fetch students list.");
      }
    } catch (e) {
      console.error(e);
      if (!isSilent) setStudentsError("A network error occurred while loading students.");
    } finally {
      if (!isSilent) setStudentsLoading(false);
    }
  }

  async function fetchAttendance(dateStr: string, isSilent = false) {
    if (!isSilent) setAttendanceLoading(true);
    try {
      const res = await fetch(`/api/teacher/attendance?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceStudents(data);
        const changes: { [studentId: number]: "PRESENT" | "ABSENT" | "LATE" } = {};
        data.forEach((student: StudentDetail) => {
          if (student.attendanceStatus) {
            changes[student.id] = student.attendanceStatus as "PRESENT" | "ABSENT" | "LATE";
          }
        });
        
        if (!isSilent || !isDirty) {
          setAttendanceChanges(changes);
        } else {
          setAttendanceChanges(prev => {
            return { ...changes, ...prev };
          });
        }
      } else {
        if (!isSilent) toast.error("Failed to load attendance records for selected date.");
      }
    } catch (e) {
      console.error(e);
      if (!isSilent) toast.error("A network error occurred while loading attendance.");
    } finally {
      if (!isSilent) setAttendanceLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDirty(false);
    setAttendanceSearchQuery("");
    if (activeTab === "students") {
      fetchStudents();
    } else if (activeTab === "attendance") {
      fetchAttendance(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate]);

  useEffect(() => {
    // Poll stats every 5 seconds to keep it synced with any database changes (e.g. from Prisma Studio)
    const interval = setInterval(() => {
      fetchDashboardData(true);
      if (activeTab === "students") {
        fetchStudents(true);
      } else if (activeTab === "attendance") {
        fetchAttendance(selectedDate, true);
      }
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate, isDirty]);

  const handleToggleAttendance = (studentId: number, status: "PRESENT" | "ABSENT" | "LATE") => {
    setIsDirty(true);
    setAttendanceChanges(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAllPresent = () => {
    setIsDirty(true);
    const changes: typeof attendanceChanges = {};
    attendanceStudents.forEach(student => {
      changes[student.id] = "PRESENT";
    });
    setAttendanceChanges(changes);
    toast.info("Marked all active students as Present locally.");
  };

  const handleSaveAttendance = async () => {
    setAttendanceSaving(true);
    try {
      const records = Object.entries(attendanceChanges).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status
      }));

      const missingCount = attendanceStudents.length - records.length;
      if (missingCount > 0) {
        toast.warning(`Please mark attendance for all ${attendanceStudents.length} students first (${missingCount} unmarked).`);
        setAttendanceSaving(false);
        return;
      }

      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          records
        })
      });

      if (res.ok) {
        toast.success("Attendance saved successfully!");
        setIsDirty(false);
        fetchAttendance(selectedDate, false);
        fetchDashboardData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save attendance");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error saving attendance records");
    } finally {
      setAttendanceSaving(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const search = searchQuery.toLowerCase().trim();
    if (!search) return true;
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const admissionNo = (student.admissionNo || "").toLowerCase();
    return fullName.includes(search) || admissionNo.includes(search);
  });

  const filteredAttendanceStudents = attendanceStudents.filter(student => {
    const search = attendanceSearchQuery.toLowerCase().trim();
    if (!search) return true;
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const admissionNo = (student.admissionNo || "").toLowerCase();
    const studentId = student.id.toString();
    return (
      fullName.includes(search) ||
      admissionNo.includes(search) ||
      studentId === search ||
      studentId.includes(search)
    );
  });

  const TABS = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "students", label: "Student Directory", icon: GraduationCap },
    { id: "attendance", label: "Mark Attendance", icon: UserCheck }
  ];

  const handleOpenConfirm = (id: number, status: "APPROVED" | "REJECTED", studentName: string) => {
    setConfirmModal({
      isOpen: true,
      leaveId: id,
      status,
      studentName
    });
  };

  const handleConfirmLeaveStatus = async () => {
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
      await fetchDashboardData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error updating leave request");
    } finally {
      setProcessingId(null);
    }
  };

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="bg-danger/10 border border-danger/20 p-6 rounded-2xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
          <div className="text-lg font-semibold text-danger mb-2">Error Loading Dashboard</div>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button 
            onClick={() => { setLoading(true); setError(null); fetchDashboardData(); }}
            className="mt-4 px-4 py-2 bg-bg-app border border-border rounded-lg text-text-heading hover:bg-bg-input transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Skeletons Layout during Loading state
  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">Classroom Overview</h1>
          <p className="text-text-secondary mt-2">Manage your current classes, schedules, and student requests.</p>
        </div>
        
        {/* Metric Cards Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>

        {/* Timetable and Chart Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-bg-card border border-border p-6 rounded-2xl flex flex-col justify-between h-80">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-text-heading font-semibold">Today&apos;s Schedule</span>
            </div>
            <div className="flex-1 space-y-3.5">
              <div className="h-10 bg-bg-card-hover/40 rounded-xl animate-pulse" />
              <div className="h-10 bg-bg-card-hover/40 rounded-xl animate-pulse" />
              <div className="h-10 bg-bg-card-hover/40 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
        </div>

        {/* Table Skeleton for Leaves */}
        <div className="bg-bg-card border border-border p-6 rounded-2xl">
          <div className="h-6 w-48 mb-6 bg-bg-card-hover/40 rounded animate-pulse" />
          <TableSkeleton columns={5} rows={3} />
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

  // Attendance Rate per Class
  const attendanceChartData = data?.attendanceChartData || [
    { className: "Grade 10-A", rate: 96.5 },
    { className: "Grade 11-B", rate: 94.2 },
    { className: "Grade 9-A", rate: 95.8 },
    { className: "Grade 12-C", rate: 96.9 }
  ];

  return (
    <div className="p-8 relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">Classroom Overview</h1>
          <p className="text-text-secondary mt-2">Manage your current classes, schedules, and student requests.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border mb-8 gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "overview" | "students" | "attendance")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-heading hover:border-border"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <>
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
                <div className="text-text-heading font-semibold">Today&apos;s Schedule</div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[260px]">
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    <th className="pb-3 font-medium text-right font-medium">Actions</th>
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
                              onClick={() => handleOpenConfirm(item.id, "APPROVED", `${item.student.firstName} ${item.student.lastName}`)}
                              className="p-1.5 bg-green/10 text-green border border-green/20 rounded-lg hover:bg-green hover:text-white transition-all hover:scale-105 shadow-sm cursor-pointer"
                              title="Approve Leave"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenConfirm(item.id, "REJECTED", `${item.student.firstName} ${item.student.lastName}`)}
                              className="p-1.5 bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger hover:text-white transition-all hover:scale-105 shadow-sm cursor-pointer"
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
        </>
      )}

      {/* Student Data Tab */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-heading">Student Directory</h2>
              <p className="text-xs text-text-secondary mt-1">View list of all enrolled students in your classes.</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border bg-bg-input text-text-heading rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="bg-bg-card border border-border shadow-shadow-card rounded-2xl overflow-hidden p-6">
            {studentsLoading ? (
              <TableSkeleton columns={4} rows={5} />
            ) : studentsError ? (
              <div className="py-8 text-center text-danger">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                {studentsError}
              </div>
            ) : filteredStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Students Found"
                description={searchQuery ? "No students match your search query." : "There are currently no students registered."}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-sm text-text-secondary">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Admission No</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-border/40 last:border-0 hover:bg-bg-app/40 transition-colors">
                        <td className="py-4 text-text-heading font-medium">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="py-4 text-text-heading">
                          {student.admissionNo || "-"}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            student.status === "ACTIVE" 
                              ? "bg-green/10 text-green border border-green/20" 
                              : "bg-danger/10 text-danger border border-danger/20"
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-4 text-text-secondary">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mark Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-heading">Mark Attendance</h2>
              <p className="text-xs text-text-secondary mt-1">Record daily attendance status for active students.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Picker */}
              <div className="flex items-center gap-2 bg-bg-card border border-border px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-primary" />
                <input
                  type="date"
                  value={selectedDate}
                  max={getTodayDateString()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm text-text-heading focus:outline-none border-none cursor-pointer"
                />
              </div>

              {/* Bulk actions */}
              <button
                onClick={handleMarkAllPresent}
                className="px-4 py-2 bg-primary-ghost/35 border border-primary/25 hover:bg-primary/20 text-primary rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Mark All Present
              </button>

              <button
                onClick={handleSaveAttendance}
                disabled={attendanceSaving || attendanceStudents.length === 0}
                className="px-4 py-2 bg-primary text-text-on-primary hover:bg-primary-mid disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-shadow-btn"
              >
                {attendanceSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save Attendance
              </button>
            </div>
          </div>

          {/* Search bar for attendance */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search students by name, ID, or admission..."
                value={attendanceSearchQuery}
                onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border bg-bg-input text-text-heading rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="bg-bg-card border border-border shadow-shadow-card rounded-2xl overflow-hidden p-6">
            {attendanceLoading ? (
              <TableSkeleton columns={4} rows={5} />
            ) : attendanceStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Active Students"
                description="There are currently no active students to mark attendance for."
              />
            ) : filteredAttendanceStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Matching Students"
                description={`No students match "${attendanceSearchQuery}".`}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-sm text-text-secondary">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Student Name</th>
                      <th className="pb-3 font-medium">Admission No</th>
                      <th className="pb-3 font-medium text-right pr-4">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredAttendanceStudents.map((student) => {
                      const status = attendanceChanges[student.id];
                      return (
                        <tr key={student.id} className="border-b border-border/40 last:border-0 hover:bg-bg-app/40 transition-colors">
                          <td className="py-4 text-text-heading">
                            #{student.id}
                          </td>
                          <td className="py-4 text-text-heading font-medium">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="py-4 text-text-heading">
                            {student.admissionNo || "-"}
                          </td>
                          <td className="py-4 text-right flex justify-end">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleAttendance(student.id, "PRESENT")}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                  status === "PRESENT"
                                    ? "bg-green/20 text-green border-green/45 shadow-sm shadow-green/10"
                                    : "border-border text-text-muted bg-bg-app hover:text-green hover:bg-green/5 hover:border-green/25"
                                }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleToggleAttendance(student.id, "ABSENT")}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                  status === "ABSENT"
                                    ? "bg-danger/20 text-danger border-danger/45 shadow-sm shadow-danger/10"
                                    : "border-border text-text-muted bg-bg-app hover:text-danger hover:bg-danger/5 hover:border-danger/25"
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => handleToggleAttendance(student.id, "LATE")}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                  status === "LATE"
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/45 shadow-sm shadow-amber-500/10"
                                    : "border-border text-text-muted bg-bg-app hover:text-amber-400 hover:bg-amber-500/5 hover:border-amber-500/25"
                                }`}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.status === "APPROVED" ? "Approve Leave Request" : "Reject Leave Request"}
          message={`Are you sure you want to ${confirmModal.status.toLowerCase()} the leave request for ${confirmModal.studentName}?`}
          confirmLabel={confirmModal.status === "APPROVED" ? "Approve" : "Reject"}
          cancelLabel="Cancel"
          isDestructive={confirmModal.status === "REJECTED"}
          onConfirm={handleConfirmLeaveStatus}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

