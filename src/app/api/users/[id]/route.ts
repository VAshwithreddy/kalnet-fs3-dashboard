import { NextResponse } from "next/server";
import { updateUserSchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { updateUser } from "@/services/user.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!rawId || isNaN(id) || id <= 0) {
      return badRequest("Invalid user id");
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid body", parsed.error.flatten());
    }

    const updatedUser = await updateUser(id, parsed.data);

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return serverError("Failed to update user", error.message);
    }

    return serverError("Failed to update user");
  }
}