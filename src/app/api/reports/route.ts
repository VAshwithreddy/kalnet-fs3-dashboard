import { NextRequest, NextResponse } from "next/server";
import { reportsQuerySchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { getReports } from "@/services/report.service";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const parsed = reportsQuerySchema.safeParse({
      type: url.searchParams.get("type"),
      startDate: url.searchParams.get("startDate") ?? undefined,
      endDate: url.searchParams.get("endDate") ?? undefined,
    });

    if (!parsed.success)
      return badRequest("Invalid query params", parsed.error.flatten());

    const data = await getReports(
      parsed.data.type,
      parsed.data.startDate,
      parsed.data.endDate
    );

    return NextResponse.json(data);

  } catch (e) {
    return serverError("Failed to load reports", String(e));
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

    return NextResponse.json(issue, { status: 201 });
  } catch (e) {
    return serverError("Failed to save reported issue", String(e));
  }
}