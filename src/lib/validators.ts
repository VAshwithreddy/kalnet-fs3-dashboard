import { z } from "zod";

/* Dashboard Charts */
export const dashboardChartsQuerySchema = z.object({
  months: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
});

/* Reports */
export const reportsQuerySchema = z.object({
  type: z.enum(["admissions", "payments", "issues", "activity"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/* Users */
export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(["ADMIN", "STAFF", "TEACHER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});