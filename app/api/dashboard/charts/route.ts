import { NextRequest, NextResponse } from "next/server";
import { dashboardChartsQuerySchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { getDashboardCharts } from "@/services/dashboard.service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const parsed = dashboardChartsQuerySchema.safeParse({
      months: url.searchParams.get("months") ?? undefined,
    });

    if (!parsed.success) return badRequest("Invalid query params", parsed.error.flatten());

    const data = await getDashboardCharts(parsed.data.months);
    return NextResponse.json(data);
  } catch (e) {
    return serverError("Failed to load dashboard charts", String(e));
  }
}