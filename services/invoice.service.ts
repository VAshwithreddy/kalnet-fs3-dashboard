import { prisma } from "@/lib/prisma";

export async function createInvoice(data: {
  studentId: number;
  issueDate: Date;
  dueDate?: Date;
  totalAmount: number;
}) {
  if (data.dueDate && data.dueDate < data.issueDate) {
    throw new Error("dueDate must be greater than or equal to issueDate");
  }

  return prisma.feeInvoice.create({
    data,
  });
}