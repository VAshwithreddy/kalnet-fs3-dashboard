import { NextResponse } from "next/server";
import { getTeacherDashboardData } from "@/services/teacher.service";
import { serverError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTeacherDashboardData();
    return NextResponse.json(data);
  } catch (e) {
    return serverError("Failed to load teacher stats", String(e));
  }
}
