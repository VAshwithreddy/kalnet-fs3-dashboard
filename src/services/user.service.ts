import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/lib/audit";

export async function createUser(
  data: Prisma.UserCreateInput
) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new Error("Email already exists");
  }

  const user = await prisma.user.create({ data });

  await logAudit("CREATE_USER", "USER", user.id);

  return user;
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return users;
}

export async function updateUser(
  id: number,
  data: Prisma.UserUpdateInput
) {
  const user = await prisma.user.update({
    where: { id },
    data,
  });

  await logAudit("UPDATE_USER", "USER", id);

  return user;
}