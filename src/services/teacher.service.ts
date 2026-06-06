// services/teacher.service.ts

import { prisma } from "../lib/prisma";

/**
 * Auto-seeds mock leave requests if the leave_requests table is empty.
 * This guarantees the teacher dashboard has data to manage out-of-the-box.
 */
async function ensureLeaveRequestsSeeded() {
  const count = await prisma.leaveRequest.count();
  if (count > 0) return;

  // Fetch some active students to assign leave requests to
  const students = await prisma.student.findMany({
    take: 5,
    where: { status: "ACTIVE" }
  });

  if (students.length === 0) return;

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const nextWeekStart = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeekEnd = new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000);
  
  const mockLeaves = [
    {
      studentId: students[0].id,
      fromDate: tomorrow,
      toDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      reason: "High fever and doctor-prescribed rest",
      status: "PENDING",
      createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      studentId: students[1].id,
      fromDate: nextWeekStart,
      toDate: nextWeekEnd,
      reason: "Attending elder sister's wedding out of state",
      status: "PENDING",
      createdAt: new Date(today.getTime() - 5 * 60 * 60 * 1000) // 5 hours ago
    },
    {
      studentId: students[2].id,
      fromDate: tomorrow,
      toDate: tomorrow,
      reason: "Urgent dental procedure (root canal)",
      status: "PENDING",
      createdAt: new Date(today.getTime() - 12 * 60 * 60 * 1000) // 12 hours ago
    },
    {
      studentId: students[3 % students.length].id,
      fromDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      toDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      reason: "Recovering from mild flu symptoms",
      status: "APPROVED",
      createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const leave of mockLeaves) {
    await prisma.leaveRequest.create({
      data: leave
    });
  }
}

export async function getTeacherDashboardData() {
  // Ensure we have some leave request data to show
  await ensureLeaveRequestsSeeded();

  const [totalStudents, pendingLeavesCount, leaveRequests] = await Promise.all([
    // 1️⃣ Total active students
    prisma.student.count({
      where: { status: "ACTIVE" }
    }),

    // 2️⃣ Pending leave requests count
    prisma.leaveRequest.count({
      where: { status: "PENDING" }
    }),

    // 3️⃣ Get all leave requests with student details
    prisma.leaveRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            admissionNo: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
  ]);

  // Mocked details to create a rich aesthetic dashboard view
  const activeClasses = 4;
  const averageAttendance = 95.8;
  const pendingGrading = 12;
  const upcomingExams = 2;

  // Mocked schedule timetable for a teacher
  const schedule = [
    { id: 1, subject: "Mathematics", grade: "Grade 10-A", time: "09:00 AM - 10:15 AM", room: "Room 302", active: true },
    { id: 2, subject: "Algebra II", grade: "Grade 11-B", time: "10:30 AM - 11:45 AM", room: "Room 105", active: false },
    { id: 3, subject: "Geometry", grade: "Grade 9-A", time: "01:00 PM - 02:15 PM", room: "Room 302", active: false },
    { id: 4, subject: "Office Hours", grade: "All Students", time: "02:30 PM - 03:30 PM", room: "Staff Room", active: false }
  ];

  return {
    totalStudents,
    pendingLeavesCount,
    leaveRequests,
    activeClasses,
    averageAttendance,
    pendingGrading,
    upcomingExams,
    schedule
  };
}

export async function updateLeaveRequestStatus(id: number, status: "APPROVED" | "REJECTED") {
  const updatedLeave = await prisma.leaveRequest.update({
    where: { id },
    data: { status },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Log to AuditLog for security compliance
  await prisma.auditLog.create({
    data: {
      action: `LEAVE_${status}`,
      entity: "LeaveRequest",
      entityId: id,
      meta: JSON.stringify({
        studentName: `${updatedLeave.student.firstName} ${updatedLeave.student.lastName}`,
        updatedAt: new Date().toISOString()
      })
    }
  });

  return updatedLeave;
}

export async function getTeacherRequests() {
  return prisma.leaveApprovalRequest.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createTeacherRequest(type: string) {
  return prisma.leaveApprovalRequest.create({
    data: {
      requestType: type,
      linkedEntityId: 1,
      requestedBy: 1,
      status: "PENDING"
    }
  });
}
