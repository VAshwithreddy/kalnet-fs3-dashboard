import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";
import crypto from "crypto";

/* ============================================================
   Get Current User from Header
============================================================ */
export async function getCurrentUser(request: Request) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    throw new Error("Unauthorized: Missing user ID");
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    throw new Error("Unauthorized: User not found");
  }

  return user;
}

/* ============================================================
   Require Specific Role (ENUM BASED)
============================================================ */
export function requireRole(user: any, roles: UserRole[]) {
  if (!user || !roles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient role");
  }
}

/**
 * Hashes a plain-text password using SHA-256 algorithm.
 * Uses Node.js built-in crypto module for compatibility and simplicity.
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}