import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    reports: [
      { title: "Executive KPI Pack", status: "Delivered" },
      { title: "Customer Health Summary", status: "Scheduled" },
      { title: "Compliance Exception Log", status: "Draft" },
    ],
  });
}
