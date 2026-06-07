// services/dashboard.service.ts

import { prisma } from "../lib/prisma";
import { logAudit } from "../lib/audit";

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
    (async () => {
      const [leaveCount, feeCount] = await Promise.all([
        prisma.leaveApprovalRequest.count({ where: { status: "PENDING" } }),
        prisma.feeAdjustmentRequest.count({ where: { status: "PENDING" } }),
      ]);
      return leaveCount + feeCount;
    })(),

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
    (async () => {
      const [leaveApprovals, feeApprovals] = await Promise.all([
        prisma.leaveApprovalRequest.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
        prisma.feeAdjustmentRequest.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
      ]);
      return [
        ...leaveApprovals.map((a) => ({
          id: a.id,
          type: a.requestType,
          status: a.status,
          createdAt: a.createdAt,
        })),
        ...feeApprovals.map((a) => ({
          id: a.id,
          type: a.requestType,
          status: a.status,
          createdAt: a.createdAt,
        })),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);
    })(),

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
  const startMonthStr = months[0];
  const startMonthDate = new Date(`${startMonthStr}-01T00:00:00Z`);

  const [admissions, invoices] = await Promise.all([
    // Admissions grouped by month
    prisma.admission.groupBy({
      by: ["admitYm"],
      where: { admitYm: { in: months } },
      _count: { id: true },
    }),

    // Outstanding fees (invoices with status ISSUED) grouped by month of issueDate
    prisma.feeInvoice.findMany({
      where: {
        status: "ISSUED",
        issueDate: { gte: startMonthDate }
      },
      select: {
        issueDate: true,
        totalAmount: true
      }
    })
  ]);

  // Convert arrays to maps
  const admissionMap = Object.fromEntries(
    admissions.map((a) => [a.admitYm, a._count.id])
  );

  const invoiceMap: Record<string, number> = {};
  invoices.forEach(inv => {
    const yyyy = inv.issueDate.getFullYear();
    const mm = String(inv.issueDate.getMonth() + 1).padStart(2, '0');
    const ym = `${yyyy}-${mm}`;
    invoiceMap[ym] = (invoiceMap[ym] || 0) + inv.totalAmount;
  });

  // Return structured result
  return months.map((month) => ({
    month,
    admissions: admissionMap[month] || 0,
    feeCollected: invoiceMap[month] || 0,
  }));
}

/* ============================================================
   ✅ Update Approval Request Status
============================================================ */
export async function updateApprovalRequestStatus(id: number, status: "APPROVED" | "REJECTED") {
  const leaveReq = await prisma.leaveApprovalRequest.findUnique({
    where: { id },
  });
  if (leaveReq) {
    const updated = await prisma.leaveApprovalRequest.update({
      where: { id },
      data: { status },
    });
    await logAudit(`LEAVE_${status}`, "LeaveApprovalRequest", id, { requestType: leaveReq.requestType });
    return updated;
  }

  const feeReq = await prisma.feeAdjustmentRequest.findUnique({
    where: { id },
  });
  if (feeReq) {
    const updated = await prisma.feeAdjustmentRequest.update({
      where: { id },
      data: { status },
    });
    await logAudit(`FEE_${status}`, "FeeAdjustmentRequest", id, { requestType: feeReq.requestType });
    return updated;
  }

  throw new Error("Approval request not found");
}