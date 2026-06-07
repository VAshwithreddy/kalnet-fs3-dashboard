// services/report.service.ts
import { prisma } from "@/lib/prisma";

export async function getReports(
  type: "admissions" | "payments" | "issues" | "activity",
  startDate?: string,
  endDate?: string
) {
  const dateFilter = {
    gte: startDate ? new Date(startDate) : undefined,
    lte: endDate ? new Date(endDate) : undefined,
  };

  if (type === "admissions") {
    return prisma.admission.findMany({
      where: { admittedAt: dateFilter },
      include: { student: true },
      orderBy: { admittedAt: "desc" },
    });
  }

  if (type === "issues") {
    return prisma.auditLog.findMany({
      where: {
        action: "ISSUE_REPORTED",
        createdAt: dateFilter,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (type === "activity") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return prisma.auditLog.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  return prisma.feePayment.findMany({
    where: { paidAt: dateFilter },
    include: { student: true },
    orderBy: { paidAt: "desc" },
  });
}