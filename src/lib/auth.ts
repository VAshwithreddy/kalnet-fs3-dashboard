import { prisma } from "./prisma";

export async function getCurrentUser(request: Request) {
  const userId = request.headers.get("x-user-id");

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: Number(userId) },
  });
}

export function requireRole(user: any, roles: string[]) {
  if (!user || !roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}