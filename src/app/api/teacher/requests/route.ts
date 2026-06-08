import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { leaveSchema } from "@/lib/validators";
import { getTeacherRequests, createTeacherRequest } from "@/services/teacher.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getTeacherRequests();
    return NextResponse.json(data);
  } catch (e: any) {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch teacher requests", null, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if it has studentId (student leave request)
    if (body && typeof body === "object" && "studentId" in body) {
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
    } else {
      // Teacher's own administrative request
      const { type } = body;
      if (!type || typeof type !== "string") {
        return errorResponse("BAD_REQUEST", "Invalid parameters. 'type' (string) is required.");
      }

      const newRequest = await createTeacherRequest(type);
      return successResponse(newRequest);
    }
  } catch (error: any) {
    return errorResponse("BAD_REQUEST", error.message);
  }
}