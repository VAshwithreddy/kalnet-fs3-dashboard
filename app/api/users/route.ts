import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createUserSchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { createUser } from "@/services/users.service";

export const runtime = "nodejs";

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