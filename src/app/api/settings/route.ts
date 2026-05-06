import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate payload minimally
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (body.type === "security") {
      // Mock security validation
      if (body.newPassword !== body.confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
      }
    }

    // Simulate network delay to show loading state in UI
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, message: "Settings saved successfully." });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
