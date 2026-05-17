import { NextRequest, NextResponse } from "next/server";
import { createUserSchema } from "@/lib/validators";
import { badRequest, serverError } from "@/lib/errors";
import { createUser } from "../../../services/user.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success)
      return badRequest("Invalid body", parsed.error.flatten());

    const user = await createUser(parsed.data);

    return NextResponse.json(user);

  } catch (error: unknown) {
  if (error instanceof Error) {
    return serverError("Failed to create user", error.message);
  }
  return serverError("Failed to create user");
}
}