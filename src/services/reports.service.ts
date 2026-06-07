import { prisma } from "@/lib/prisma";

export async function getReport(
  querytype: "fees" | "admissions" | "approvals" | "leave",
  from: Date,
  to: Date
) {
  switch (querytype) {
    case "fees":
      return prisma.feePayment.findMany({
        where: { status: "SUCCESS", paidAt: { gte: from, lt: to } },
        orderBy: { paidAt: "asc" },
      });

    case "admissions":
      return prisma.admission.findMany({
        where: { admittedAt: { gte: from, lt: to } },
        orderBy: { admittedAt: "asc" },
        include: { student: true },
      });

    case "approvals":
      return (async () => {
        const [leaveApprovals, feeApprovals] = await Promise.all([
          prisma.leaveApprovalRequest.findMany({
            where: { createdAt: { gte: from, lt: to } },
            orderBy: { createdAt: "asc" },
          }),
          prisma.feeAdjustmentRequest.findMany({
            where: { createdAt: { gte: from, lt: to } },
            orderBy: { createdAt: "asc" },
          }),
        ]);
        return [
          ...leaveApprovals.map((a) => ({
            id: a.id,
            type: a.requestType,
            status: a.status,
            createdAt: a.createdAt,
            resolvedAt: a.status !== "PENDING" ? a.updatedAt : null,
          })),
          ...feeApprovals.map((a) => ({
            id: a.id,
            type: a.requestType,
            status: a.status,
            createdAt: a.createdAt,
            resolvedAt: a.status !== "PENDING" ? a.updatedAt : null,
          })),
        ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      })();

    case "leave":
      return prisma.leaveRequest.findMany({
        where: { createdAt: { gte: from, lt: to } },
        orderBy: { createdAt: "asc" },
        include: { student: true },
      });
  }
}
