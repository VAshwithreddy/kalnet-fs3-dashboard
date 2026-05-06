import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboard.service";
import { serverError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        latestApprovals: [
          { id: 1, type: "Leave Request", status: "PENDING", createdAt: new Date().toISOString() },
          { id: 2, type: "Expense Report", status: "APPROVED", createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, type: "Course Material", status: "PENDING", createdAt: new Date(Date.now() - 172800000).toISOString() },
        ],
        latestAdmissions: [
          { id: 1, admissionNo: "ADM-2026-041", student: { firstName: "Alexander", lastName: "Pierce" }, admittedAt: new Date().toISOString() },
          { id: 2, admissionNo: "ADM-2026-042", student: { firstName: "Sophia", lastName: "Montgomery" }, admittedAt: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, admissionNo: "ADM-2026-043", student: { firstName: "Elias", lastName: "Vance" }, admittedAt: new Date(Date.now() - 172800000).toISOString() },
          { id: 4, admissionNo: "ADM-2026-044", student: { firstName: "Isabella", lastName: "Sato" }, admittedAt: new Date(Date.now() - 259200000).toISOString() },
          { id: 5, admissionNo: "ADM-2026-045", student: { firstName: "Marcus", lastName: "Sterling" }, admittedAt: new Date(Date.now() - 345600000).toISOString() },
        ],
        mock: true,
      });
    }

    const data = await getDashboardStats();
    return NextResponse.json(data);
  } catch (e) {
    return serverError("Failed to load dashboard stats", String(e));
  }
}
