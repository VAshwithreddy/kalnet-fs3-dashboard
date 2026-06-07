import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getPagination } from "@/lib/pagination";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { skip, take, page, limit } = getPagination(searchParams);

    const where = { status: "PENDING" };

    const [data, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: { student: true },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return successResponse(data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return errorResponse("BAD_REQUEST", error.message);
  }
}