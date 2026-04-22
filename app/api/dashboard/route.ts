import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    kpis: {
      activeUsers: 124,
      pendingReports: 3,
      approvalRate: "98.4%",
    },
    trend: [
      { month: "Jan", revenue: 24 },
      { month: "Feb", revenue: 28 },
      { month: "Mar", revenue: 31 },
      { month: "Apr", revenue: 37 },
    ],
  });
}
