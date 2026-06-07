import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = new Date(searchParams.get("from")!);
  const to = new Date(searchParams.get("to")!);

  const payments = await prisma.feePayment.findMany({
    where: { paidAt: { gte: from, lt: to } },
    include: { student: true },
  });

  return successResponse(payments);
}