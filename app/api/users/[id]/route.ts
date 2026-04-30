import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { patchUserSchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { patchUser } from "@/services/users.service";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) return badRequest("Invalid user id");

    const body = await req.json().catch(() => null);
    const parsed = patchUserSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid request body", parsed.error.flatten());

    const updated = await patchUser(userId, parsed.data);
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      return badRequest("User not found");
    }
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
      return badRequest("Email already exists");
    }
    return serverError("Failed to update user", String(e));
  }
}