import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { id, reviewedBy } = await request.json();

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    await logAudit("APPROVE", "LeaveRequest", id, { new: leave }, reviewedBy, request);

    return successResponse(leave);
  } catch (error: any) {
    return errorResponse("BAD_REQUEST", error.message);
  }
}