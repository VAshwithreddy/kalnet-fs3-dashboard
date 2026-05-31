import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [adminUser, teacherUser] = await Promise.all([
      // Fetch an active Admin
      prisma.user.findFirst({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { email: true }
      }),
      // Fetch an active Teacher or Staff
      prisma.user.findFirst({
        where: {
          OR: [
            { role: "TEACHER" },
            { role: "STAFF" }
          ],
          status: "ACTIVE"
        },
        select: { email: true }
      })
    ]);

    return NextResponse.json({
      admin: adminUser?.email || "admin@kalnet.edu",
      teacher: teacherUser?.email || "teacher@kalnet.edu"
    });

  } catch (e) {
    return serverError("Failed to fetch demo credentials", String(e));
  }
}
