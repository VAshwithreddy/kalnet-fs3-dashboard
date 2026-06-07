import { NextResponse } from "next/server";
import { getTeacherStudents } from "@/services/teacher.service";
import { serverError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTeacherStudents();
    return NextResponse.json(data);
  } catch (e) {
    return serverError("Failed to load students", String(e));
  }
}
