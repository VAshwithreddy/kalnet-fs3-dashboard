// services/report.service.ts
import { prisma } from "@/lib/prisma";

export async function getReports(
  type: "admissions" | "payments",
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

  return prisma.feePayment.findMany({
    where: { paidAt: dateFilter },
    include: { student: true },
    orderBy: { paidAt: "desc" },
  });
}