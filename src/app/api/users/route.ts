import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createUserSchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { createUser, listUsers } from "@/services/users.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (process.env.USE_MOCK === "true") {
      return NextResponse.json({
        users: [
          { id: 1, email: "admin@kalnet.edu", name: "Admin User", role: "ADMIN", status: "ACTIVE" },
          { id: 2, email: "teacher@kalnet.edu", name: "Teacher User", role: "STAFF", status: "ACTIVE" }
        ]
      });
    }

    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (e: unknown) {
    return serverError("Failed to load users", String(e));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid request body", parsed.error.flatten());

    const user = await createUser(parsed.data);
    return NextResponse.json(user, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
      return badRequest("Email already exists");
    }
    return serverError("Failed to create user", String(e));
  }
}
