import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";

import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await context.params;
  const invoices = await prisma.feeInvoice.findMany({
    where: { studentId: Number(studentId) },
  });

  return successResponse(invoices);
}