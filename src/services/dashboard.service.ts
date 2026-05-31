// services/dashboard.service.ts

import { prisma } from "../lib/prisma";

/* ============================================================
   Helper: Get Last N Months (YYYY-MM)
============================================================ */
function getLastMonths(count: number) {
  const months: string[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}-${mm}`);
  }

  return months;
}

/* ============================================================
   ✅ Dashboard STATS (6 Metrics)
   Uses Promise.all for parallel execution
============================================================ */
export async function getDashboardStats() {
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const [
    studentsEnrolled,
    approvalsPending,
    outstandingFees,
    newAdmissionsThisMonth,
    totalStaff,
    feesCollectedThisMonth,
    latestApprovals,
    latestAdmissions,
    leavePending,
  ] = await Promise.all([
    // 1️⃣ Total Students
    prisma.student.count(),

    // 2️⃣ Pending Approvals
    prisma.approvalRequest.count({
      where: { status: "PENDING" },
    }),

    // 3️⃣ Outstanding Fees (Sum of ISSUED invoices)
    prisma.feeInvoice.aggregate({
      _sum: { totalAmount: true },
      where: { status: "ISSUED" },
    }),

    // 4️⃣ New Admissions This Month
    prisma.admission.count({
      where: { admittedAt: { gte: startOfMonth } },
    }),

    // 5️⃣ Total Staff
    prisma.user.count({
      where: { role: "STAFF" },
    }),

    // 6️⃣ Fee Collected This Month
    prisma.feePayment.aggregate({
      _sum: { amount: true },
      where: {
        status: "SUCCESS",
        paidAt: { gte: startOfMonth },
      },
    }),

    // 7️⃣ Latest Approvals
    prisma.approvalRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),

    // 8️⃣ Latest Admissions
    prisma.admission.findMany({
      take: 5,
      orderBy: { admittedAt: "desc" },
      include: { student: true },
    }),

    // 9️⃣ Leave Requests Pending
    prisma.leaveRequest.count({
      where: { status: "PENDING" },
    }),
  ]);

  return {
    studentsEnrolled,
    approvalsPending,
    outstandingFees: Number(
      outstandingFees._sum.totalAmount || 0
    ),
    newAdmissionsThisMonth,
    totalStaff,
    feesCollectedThisMonth: Number(
      feesCollectedThisMonth._sum.amount || 0
    ),
    leavePending,
    latestApprovals,
    latestAdmissions,
  };
}

/* ============================================================
   ✅ Dashboard CHARTS (Last 6 Months)
   Uses groupBy on indexed fields admitYm & paidYm
============================================================ */
export async function getDashboardCharts(monthsCount?: number) {
  const months = getLastMonths(monthsCount ?? 6);

  const [admissions, payments] = await Promise.all([
    // Admissions grouped by month
    prisma.admission.groupBy({
      by: ["admitYm"],
      where: { admitYm: { in: months } },
      _count: { id: true },
    }),

    // Fee payments grouped by month
    prisma.feePayment.groupBy({
      by: ["paidYm"],
      where: {
        paidYm: { in: months },
        status: "SUCCESS",
      },
      _sum: { amount: true },
    }),
  ]);

  // Convert arrays to maps
  const admissionMap = Object.fromEntries(
    admissions.map((a) => [a.admitYm, a._count.id])
  );

  const paymentMap = Object.fromEntries(
    payments.map((p) => [
      p.paidYm,
      Number(p._sum.amount || 0),
    ])
  );

  // Return structured result
  return months.map((month) => ({
    month,
    admissions: admissionMap[month] || 0,
    feeCollected: paymentMap[month] || 0,
  }));
}

/* ============================================================
   ✅ Update Approval Request Status
============================================================ */
export async function updateApprovalRequestStatus(id: number, status: "APPROVED" | "REJECTED") {
  return prisma.approvalRequest.update({
    where: { id },
    data: {
      status,
      resolvedAt: new Date(),
    },
  });
}