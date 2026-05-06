import { NextRequest, NextResponse } from "next/server";
import { dashboardChartsQuerySchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { getDashboardCharts } from "@/services/dashboard.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const parsed = dashboardChartsQuerySchema.safeParse({
      months: url.searchParams.get("months") ?? undefined,
    });

    if (!parsed.success) return badRequest("Invalid query params", parsed.error.flatten());

    if (process.env.USE_MOCK === "true") {
      return NextResponse.json({
        range: { from: "2026-01-01", to: "2026-07-01", months: 6 },
        feeCollectionMonthly: [
          { month: 'Jan', total: 45000 },
          { month: 'Feb', total: 38000 },
          { month: 'Mar', total: 55000 },
          { month: 'Apr', total: 48000 },
          { month: 'May', total: 42000 },
          { month: 'Jun', total: 65000 },
          { month: 'Jul', total: 31000 },
        ],
        admissionsMonthly: [
          { month: 'Jan', count: 120 },
          { month: 'Feb', count: 98 },
          { month: 'Mar', count: 150 },
          { month: 'Apr', count: 130 },
          { month: 'May', count: 110 },
          { month: 'Jun', count: 170 },
          { month: 'Jul', count: 90 },
        ]
      });
    }

    const data = await getDashboardCharts(parsed.data.months);
    return NextResponse.json(data);
  } catch (e) {
    return serverError("Failed to load dashboard charts", String(e));
  }
}
