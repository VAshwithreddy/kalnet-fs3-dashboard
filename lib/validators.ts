import { z } from "zod";

export const dashboardChartsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});

export const reportsQuerySchema = z.object({
  querytype: z.enum(["fees", "admissions", "approvals", "leave"]),
  from: z.string().min(1),
  to: z.string().min(1),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const patchUserSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().min(2).max(120).optional(),
    role: z.enum(["ADMIN", "STAFF"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, "At least one field is required");