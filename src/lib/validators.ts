import { z } from "zod";

export const leaveSchema = z.object({
  studentId: z.number(),
  fromDate: z.string(),
  toDate: z.string(),
  reason: z.string().optional(),
});

export const staffStatusSchema = z.object({
  staffId: z.number(),
  markedDate: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"]),
});

export const feeCollectSchema = z.object({
  invoiceId: z.number(),
  amount: z.number().positive(),
  method: z.string().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "STAFF", "TEACHER"]).optional(),
  status: z.string().optional(),
  department: z.string().optional().nullable(),
});

export const updateUserSchema = createUserSchema.partial();