import { NextRequest, NextResponse } from "next/server";
import { reportsQuerySchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { getReports } from "@/services/report.service";

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