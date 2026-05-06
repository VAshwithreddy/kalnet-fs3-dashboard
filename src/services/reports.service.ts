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
      return prisma.approvalRequest.findMany({
        where: { createdAt: { gte: from, lt: to } },
        orderBy: { createdAt: "asc" },
      });

    case "leave":
      return prisma.leaveRequest.findMany({
        where: { createdAt: { gte: from, lt: to } },
        orderBy: { createdAt: "asc" },
        include: { student: true },
      });
  }
}
