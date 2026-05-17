import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function logAudit(
  action: string,
  entity: string,
  entityId: number,
  meta?: Prisma.InputJsonValue
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        meta,
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}