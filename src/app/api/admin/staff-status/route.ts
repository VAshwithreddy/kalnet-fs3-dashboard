import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { staffStatusSchema } from "@/lib/validators";
import { getPagination } from "@/lib/pagination";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    rateLimit("admin-staff-status", 10);

    const user = await getCurrentUser(request);
    requireRole(user, ["ADMIN"]);

    const body = await request.json();
    const data = staffStatusSchema.parse(body);

    const markedDate = new Date(data.markedDate);

    const status = await prisma.staffActiveStatus.upsert({
      where: {
        staffId_markedDate: {
          staffId: data.staffId,
          markedDate,
        },
      },
      update: {
        status: data.status,
        markedBy: user!.id,
      },
      create: {
        staffId: data.staffId,
        markedDate,
        status: data.status,
        markedBy: user!.id,
      },
    });

    await logAudit(
      "UPDATE",
      "StaffActiveStatus",
      status.id,
      { new: status },
      user!.id,
      request
    );

    return successResponse(status);
  } catch (error: any) {
    return errorResponse("BAD_REQUEST", error.message);
  }
}

/* ============================================================
   GET → Staff Status Report
   Supports:
   ?date=2026-06-07
   ?department=Science
   ?page=1&limit=10
============================================================ */

export async function GET(request: Request) {
  try {
    rateLimit("admin-staff-status", 100);

    const user = await getCurrentUser(request);
    requireRole(user, ["ADMIN"]);

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const department = searchParams.get("department");

    const { skip, take, page, limit } = getPagination(searchParams);

    const where: any = {};

    if (date) {
      where.markedDate = new Date(date);
    }

    if (department) {
      where.staff = {
        department,
      };
    }

    const [data, total] = await Promise.all([
      prisma.staffActiveStatus.findMany({
        where,
        include: { staff: true },
        skip,
        take,
        orderBy: { markedDate: "desc" },
      }),
      prisma.staffActiveStatus.count({ where }),
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