import { prisma } from "./prisma";

export async function logAudit(
  action: string,
  entity: string,
  entityId: number,
  data?: any,
  performedBy?: number,
  request?: Request
) {
  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      performedBy: performedBy || 0,
      changeDetails: data ? (typeof data === "string" ? data : JSON.stringify(data)) : null,
      meta: data ? JSON.stringify(data) : null,
      ipAddress: request?.headers.get("x-forwarded-for") || "",
      userAgent: request?.headers.get("user-agent") || "",
    },
  });
}