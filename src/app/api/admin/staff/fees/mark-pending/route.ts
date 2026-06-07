import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  const { invoiceId } = await request.json();

  const invoice = await prisma.feeInvoice.update({
    where: { id: invoiceId },
    data: { status: "PENDING" },
  });

  return successResponse(invoice);
}