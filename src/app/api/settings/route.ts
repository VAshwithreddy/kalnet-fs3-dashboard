import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to load settings:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate payload minimally
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Handle security settings
    if (body.type === "security") {
      const { currentEmail, currentPassword, newPassword, confirmPassword } = body;

      if (!currentEmail) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }
      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json({ error: "All password fields are required" }, { status: 400 });
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: currentEmail }
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check current password
      const hashedCurrent = hashPassword(currentPassword);
      const expectedPassword = user.password || (user.role === "ADMIN" ? hashPassword("admin123") : hashPassword("teacher123"));

      if (hashedCurrent !== expectedPassword) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      // Update password
      const hashedNew = hashPassword(newPassword);
      await prisma.user.update({
        where: { email: currentEmail },
        data: { password: hashedNew }
      });

      await logAudit("UPDATE_SECURITY_SETTINGS", "USER", user.id, undefined, user.id, req);

      return NextResponse.json({ success: true, message: "Security settings saved." });
    }

    // Handle profile settings
    if (body.type === "profile") {
      const { currentEmail, firstName, lastName, email, bio } = body;

      if (!currentEmail || !email || !firstName) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Check if email already exists (if changing to a different email)
      if (currentEmail !== email) {
        const existing = await prisma.user.findUnique({
          where: { email }
        });
        if (existing) {
          return NextResponse.json({ error: "Email address already in use." }, { status: 400 });
        }
      }

      const fullName = `${firstName} ${lastName}`.trim();

      const user = await prisma.user.update({
        where: { email: currentEmail },
        data: {
          email: email,
          name: fullName
        }
      });

      await logAudit("UPDATE_PROFILE_SETTINGS", "USER", user.id, { name: user.name });

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  } catch (error: any) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}
