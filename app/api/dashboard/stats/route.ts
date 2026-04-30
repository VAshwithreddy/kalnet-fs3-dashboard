import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboard.service";
import { serverError } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Week-1 scaffold with mock data
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

    const data = await getDashboardStats();
    return NextResponse.json(data);
  } catch (e) {
    return serverError("Failed to load dashboard stats", String(e));
  }
}