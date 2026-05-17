import { NextRequest, NextResponse } from "next/server";
import { updateUserSchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { updateUser } from "@/services/user.service";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const id = Number(context.params.id);

    if (!id || isNaN(id)) {
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