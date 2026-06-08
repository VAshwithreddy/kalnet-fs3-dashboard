import { successResponse, errorResponse } from "@/lib/api-response";
import { getReport } from "@/services/reports.service";
import { getReports } from "@/services/report.service";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return errorResponse("BAD_REQUEST", "Missing 'type' query parameter");
    }

    // Handle old/legacy types (activity, issues)
    if (type === "activity" || type === "issues") {
      const data = await getReports(type as any);
      return successResponse(data);
    }

    // Handle new types (fees, admissions, approvals, leave)
    const fromParam = searchParams.get("from") || searchParams.get("startDate");
    const toParam = searchParams.get("to") || searchParams.get("endDate");

    // If dates are provided, or it is a new report type, we use plural getReport
    if (type === "fees" || type === "approvals" || type === "leave" || (type === "admissions" && fromParam)) {
      if (!fromParam) {
        return errorResponse("BAD_REQUEST", "Missing 'from' or 'startDate' parameter");
      }
      const from = new Date(fromParam);
      const to = new Date(toParam || new Date());
      const data = await getReport(type as any, from, to);
      return successResponse(data);
    }

    // Fallback/Legacy admissions or payments
    const data = await getReports(type as any, fromParam ?? undefined, toParam ?? undefined);
    return successResponse(data);
  } catch (error: any) {
    return errorResponse("BAD_REQUEST", error.message);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, reporterName, issueType } = body;

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Invalid parameters. 'description' (string) is required." },
        { status: 400 }
      );
    }

    const issue = await prisma.auditLog.create({
      data: {
        action: "ISSUE_REPORTED",
        entity: "SystemIssue",
        entityId: 0,
        changeDetails: description,
        meta: JSON.stringify({ 
          reporterName: reporterName || "Anonymous", 
          status: "Pending",
          issueType: issueType || "Bug / Technical Issue"
        })
      }
    });

    return successResponse(issue, undefined, 201);
  } catch (e: any) {
    return errorResponse("INTERNAL_SERVER_ERROR", e.message, null, 500);
  }
}