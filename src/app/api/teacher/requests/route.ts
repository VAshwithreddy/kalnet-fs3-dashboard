import { NextResponse } from "next/server";
import { getTeacherRequests, createTeacherRequest } from "@/services/teacher.service";
import { serverError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTeacherRequests();
    return NextResponse.json(data);
  } catch (e) {
    return serverError("Failed to fetch teacher requests", String(e));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "Invalid parameters. 'type' (string) is required." },
        { status: 400 }
      );
    }

    const newRequest = await createTeacherRequest(type);
    return NextResponse.json(newRequest, { status: 201 });
  } catch (e) {
    return serverError("Failed to create approval request", String(e));
  }
}
