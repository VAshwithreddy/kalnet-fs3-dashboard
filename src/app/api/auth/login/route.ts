import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query database for user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please enter a valid registered email." },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Your account is currently inactive. Please contact the system administrator." },
        { status: 403 }
      );
    }

    // Determine target portal role: ADMIN goes to Admin portal, TEACHER/STAFF goes to Teacher/Staff portal.
    let mappedRole = user.role;
    if (mappedRole === "STAFF") {
      mappedRole = "TEACHER";
    }

    if (mappedRole !== "ADMIN" && mappedRole !== "TEACHER") {
      return NextResponse.json(
        { error: "Access Denied: You do not have permissions to access these dashboards." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      role: mappedRole
    });

  } catch (e) {
    return serverError("Failed to authenticate user", String(e));
  }
}
