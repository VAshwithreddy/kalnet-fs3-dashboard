import { prisma } from "@/lib/prisma";

export async function logAudit(
  action: string,
  entity: string,
  entityId: number,
  meta?: Record<string, unknown>
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