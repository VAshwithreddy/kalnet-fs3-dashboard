import { NextRequest, NextResponse } from "next/server";
import { reportsQuerySchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { parseISODate } from "@/lib/date";
import { getReport } from "@/services/reports.service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const parsed = reportsQuerySchema.safeParse({
      querytype: url.searchParams.get("querytype"),
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
    });

    if (!parsed.success) return badRequest("Invalid query params", parsed.error.flatten());

    let from: Date, to: Date;
    try {
      from = parseISODate(parsed.data.from);
      to = parseISODate(parsed.data.to);
    } catch {
      return badRequest("Invalid from/to date. Use ISO like 2026-04-01");
    }

    if (from >= to) return badRequest("`from` must be less than `to`");

    const rows = await getReport(parsed.data.querytype, from, to);
    return NextResponse.json({
      querytype: parsed.data.querytype,
      from,
      to,
      count: rows.length,
      rows,
    });
  } catch (e) {
    return serverError("Failed to generate report", String(e));
  }
}