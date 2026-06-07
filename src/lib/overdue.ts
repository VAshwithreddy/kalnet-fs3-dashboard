import { prisma } from "./prisma";

export async function updateOverdueInvoices() {
  const today = new Date();

  await prisma.feeInvoice.updateMany({
    where: {
      dueDate: { lt: today },
      status: { in: ["ISSUED", "PARTIALLY_PAID"] },
    },
    data: { status: "OVERDUE" },
  });
}