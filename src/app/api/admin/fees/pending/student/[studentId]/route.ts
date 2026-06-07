import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  const invoices = await prisma.feeInvoice.findMany({
    where: { studentId: Number(params.studentId) },
  });

  return successResponse(invoices);
}