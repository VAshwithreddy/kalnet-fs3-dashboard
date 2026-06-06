import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function logAudit(
  action: string,
  entity: string,
  entityId: number,
  performedBy: number,
  changeDetails?: Prisma.InputJsonValue,
  ipAddress?: string,
  userAgent?: string
) {
  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      performedBy,
      changeDetails,
      ipAddress,
      userAgent,
    },
  });
}