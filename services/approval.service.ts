import { prisma } from "@/lib/prisma";

export async function requestLeaveApproval(
  leaveId: number,
  requestedBy: number
) {
  return prisma.leaveApprovalRequest.create({
    data: {
      leaveId,
      requestedBy,
      status: "PENDING",
    },
  });
}

export async function reviewLeaveApproval(
  id: number,
  reviewedBy: number,
  status: "APPROVED" | "REJECTED",
  notes?: string
) {
  if (status !== "APPROVED" && status !== "REJECTED") {
    throw new Error("Invalid approval status");
  }

  return prisma.leaveApprovalRequest.update({
    where: { id },
    data: {
      reviewedBy,
      status,
      approvalNotes: notes,
    },
  });
}