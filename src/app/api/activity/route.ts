import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(logs);
  } catch (error: unknown) {
    return serverError(
      "Failed to load activity logs",
      error instanceof Error ? error.message : String(error)
    );
  }
}
