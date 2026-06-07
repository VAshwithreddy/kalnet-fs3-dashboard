import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { FeeStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, amount, method, collectedBy } = body;

    if (!invoiceId || !amount) {
      throw new Error("invoiceId and amount are required");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // ✅ STEP 1: Validate invoice exists
    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new Error("Invalid invoiceId");
    }

    const totalDue = invoice.totalAmount + invoice.fineAmount;
    const balance = totalDue - invoice.paidAmount;

    if (amount > balance) {
      throw new Error("Payment exceeds remaining balance");
    }

    // ✅ STEP 2: Create payment
    const payment = await prisma.feePayment.create({
      data: {
        invoiceId: invoice.id,
        studentId: invoice.studentId,
        amount,
        method,
        paidYm: new Date().toISOString().slice(0, 7),
      },
    });

    // ✅ STEP 3: Update invoice
    const updatedPaid = invoice.paidAmount + amount;

    let newStatus: FeeStatus = FeeStatus.PARTIALLY_PAID;

    if (updatedPaid === totalDue) {
      newStatus = FeeStatus.PAID;
    }

    const updatedInvoice = await prisma.feeInvoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: updatedPaid,
        status: newStatus,
      },
    });

    // ✅ STEP 4: Create payment log (FULL TRACE)
    await prisma.feePaymentLog.create({
      data: {
        invoiceId: invoice.id,
        paymentAmount: amount,
        paymentMethod: method,
        updatedBy: collectedBy || null,
      },
    });

    // ✅ STEP 5: Audit log
    await logAudit(
      "FEE_PAYMENT",
      "FeeInvoice",
      invoice.id,
      {
        old: { paidAmount: invoice.paidAmount },
        new: { paidAmount: updatedPaid },
      },
      collectedBy,
      request
    );

    return successResponse({
      invoice: updatedInvoice,
      payment,
    });
  } catch (error: any) {
    return errorResponse("BAD_REQUEST", error.message);
  }
}