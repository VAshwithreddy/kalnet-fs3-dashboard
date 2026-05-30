import { prisma } from "@/lib/prisma";

export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export function createUser(data: {
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
  status: "ACTIVE" | "INACTIVE";
}) {
  return prisma.user.create({ data });
}

export function patchUser(
  id: number,
  data: Partial<{
    email: string;
    name: string;
    role: "ADMIN" | "STAFF";
    status: "ACTIVE" | "INACTIVE";
  }>
) {
  return prisma.user.update({ where: { id }, data });
}
