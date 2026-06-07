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