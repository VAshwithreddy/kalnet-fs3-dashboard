import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    users: [
      { name: "Avery Jordan", email: "avery@kalnet.dev", role: "ADMIN" },
      { name: "Nadia Khan", email: "nadia@kalnet.dev", role: "ANALYST" },
      { name: "Leo Garcia", email: "leo@kalnet.dev", role: "VIEWER" },
    ],
  });
}
