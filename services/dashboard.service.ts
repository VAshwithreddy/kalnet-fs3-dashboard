import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { startOfMonth, startOfNextMonth } from "@/lib/date";

export async function getDashboardStats() {
  const monthStart = startOfMonth();
  const nextMonthStart = startOfNextMonth();

  const [
    studentsEnrolled,
    approvalsPending,
    outstandingRows,
    newAdmissionsThisMonth,
    feesCollectedAgg,
    leavePending,
  ] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),

    prisma.approvalRequest.count({ where: { status: "PENDING" } }),

    prisma.$queryRaw<{ outstanding_fees: string }[]>`
      SELECT IFNULL(SUM(t.outstanding), 0) AS outstanding_fees
      FROM (
        SELECT
          fi.id,
          (fi.totalAmount - IFNULL(SUM(fp.amount), 0)) AS outstanding
        FROM fee_invoices fi
        LEFT JOIN fee_payments fp
          ON fp.invoiceId = fi.id
         AND fp.status = 'SUCCESS'
        WHERE fi.status = 'ISSUED'
        GROUP BY fi.id
        HAVING outstanding > 0
      ) t;
    `,

    prisma.admission.count({
      where: { admittedAt: { gte: monthStart, lt: nextMonthStart } },
    }),

    prisma.feePayment.aggregate({
      where: { status: "SUCCESS", paidAt: { gte: monthStart, lt: nextMonthStart } },
      _sum: { amount: true },
    }),

    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
  ]);

  return {
    studentsEnrolled,
    approvalsPending,
    outstandingFees: Number(outstandingRows?.[0]?.outstanding_fees ?? 0),
    newAdmissionsThisMonth,
    feesCollectedThisMonth: Number(feesCollectedAgg._sum.amount ?? 0),
    leavePending,
  };
}

export async function getDashboardCharts(months: number) {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const feeCollections = await prisma.feePayment.groupBy({
    by: ["paidYm"] as Prisma.FeePaymentScalarFieldEnum[],
    where: { status: "SUCCESS", paidAt: { gte: from, lt: to } },
    _sum: { amount: true },
    orderBy: [{ paidYm: "asc" }], // IMPORTANT: no "as const"
  });

  const admissions = await prisma.admission.groupBy({
    by: ["admitYm"] as Prisma.AdmissionScalarFieldEnum[],
    where: { admittedAt: { gte: from, lt: to } },
    _count: { _all: true },
    orderBy: [{ admitYm: "asc" }], // IMPORTANT: no "as const"
  });

  return {
    range: { from, to, months },
    feeCollectionMonthly: feeCollections.map((r) => ({
      month: r.paidYm,
      total: Number(r._sum.amount ?? 0),
    })),
    admissionsMonthly: admissions.map((r) => ({
      month: r.admitYm,
      count: r._count._all,
    })),
  };
}