import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboard.service";
import { serverError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ✅ Optional mock support
    if (process.env.USE_MOCK === "true") {
      return NextResponse.json({
        studentsEnrolled: 847,
        approvalsPending: 12,
        outstandingFees: 240000,
        newAdmissionsThisMonth: 34,
        feesCollectedThisMonth: 360250,
        leavePending: 6,
        mock: true,
      });
    }

    // ✅ Real DB call
    const data = await getDashboardStats();

    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return serverError(
        "Failed to load dashboard stats",
        error.message
      );
    }

    return serverError("Failed to load dashboard stats");
  }
}