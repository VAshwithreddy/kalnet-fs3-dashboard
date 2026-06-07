import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { successResponse, errorResponse } from "@/lib/api-response";
export async function POST(request: Request) {
  try {
    const { id, reviewedBy, reason } = await request.json();

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason: reason },
    });

    await logAudit("REJECT", "LeaveRequest", id, { new: leave }, reviewedBy, request);

    return successResponse(leave);
  } catch (error: any) {
    return errorResponse("BAD_REQUEST", error.message);
  }
}