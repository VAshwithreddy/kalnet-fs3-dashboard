import { NextResponse } from "next/server";
import { updateApprovalRequestStatus } from "@/services/dashboard.service";
import { serverError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status || (status !== "APPROVED" && status !== "REJECTED")) {
      return NextResponse.json(
        { error: "Invalid parameters. 'id' and 'status' (APPROVED or REJECTED) are required." },
        { status: 400 }
      );
    }

    const updated = await updateApprovalRequestStatus(Number(id), status);
    return NextResponse.json(updated);
  } catch (e) {
    return serverError("Failed to update approval request status", String(e));
  }
}
