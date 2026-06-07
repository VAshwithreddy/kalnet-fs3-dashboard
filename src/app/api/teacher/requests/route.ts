import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { leaveSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = leaveSchema.parse(body);

    const leave = await prisma.leaveRequest.create({
      data: {
        studentId: data.studentId,
        fromDate: new Date(data.fromDate),
        toDate: new Date(data.toDate),
        reason: data.reason,
      },
    });

    return successResponse(leave);
  } catch (error: any) {
    return errorResponse("BAD_REQUEST", error.message);
  }
}