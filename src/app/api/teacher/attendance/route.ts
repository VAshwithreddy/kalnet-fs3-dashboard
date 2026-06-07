import { NextRequest, NextResponse } from "next/server";
import { getStudentsWithAttendance, saveStudentAttendance } from "@/services/teacher.service";
import { serverError, badRequest } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    if (!dateStr) {
      return badRequest("Missing date parameter");
    }
    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return badRequest("Invalid date format. Expected YYYY-MM-DD");
    }
    const data = await getStudentsWithAttendance(dateStr);
    return NextResponse.json(data);
  } catch (e) {
    return serverError("Failed to load attendance", String(e));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, records } = body;
    
    if (!date) {
      return badRequest("Missing date parameter");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return badRequest("Invalid date format. Expected YYYY-MM-DD");
    }
    if (!Array.isArray(records)) {
      return badRequest("Records must be an array");
    }
    
    // Validate records structure
    for (const record of records) {
      if (typeof record.studentId !== "number" || typeof record.status !== "string") {
        return badRequest("Invalid record structure. Expected studentId (number) and status (string)");
      }
      if (!["PRESENT", "ABSENT", "LATE"].includes(record.status)) {
        return badRequest(`Invalid status "${record.status}". Expected PRESENT, ABSENT, or LATE`);
      }
    }
    
    await saveStudentAttendance(date, records);
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return serverError("Failed to save attendance", String(e));
  }
}
