import { NextRequest, NextResponse } from "next/server";
import { getDashboardCharts } from "@/services/dashboard.service";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const monthsParam = url.searchParams.get("months");

    const months = monthsParam ? Number(monthsParam) : 6;

    const data = await getDashboardCharts(months);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
        },
      },
      { status: 500 }
    );
  }
}