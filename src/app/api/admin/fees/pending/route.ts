import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  const invoices = await prisma.feeInvoice.findMany({
    where: {
      status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] },
    },
    include: { student: true },
  });

  const result = invoices.map(inv => ({
    ...inv,
    balance: inv.totalAmount + inv.fineAmount - inv.paidAmount,
  }));

  return successResponse(result);
}