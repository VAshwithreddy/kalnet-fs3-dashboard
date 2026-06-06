import { prisma } from "@/lib/prisma";

export async function createLeaveRequest(data: {
  studentId: number;
  fromDate: Date;
  toDate: Date;
  reason?: string;
}) {
  if (data.toDate < data.fromDate) {
    throw new Error("toDate must be greater than or equal to fromDate");
  }

  return prisma.leaveRequest.create({
    data,
  });
}