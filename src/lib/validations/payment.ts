import { z } from "zod";
import { isoDateSchema, paymentModeSchema, uuidSchema } from "./common";

export const recordPaymentSchema = z.object({
  tenancy_id: uuidSchema,
  amount: z.coerce
    .number()
    .positive("Amount must be more than 0")
    .max(100_000_000),
  paid_on: isoDateSchema,
  mode: paymentModeSchema.default("cash"),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export const maintenanceRequestSchema = z.object({
  tenancy_id: uuidSchema,
  title: z.string().trim().min(3, "Describe the issue briefly").max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const maintenanceStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(["open", "in_progress", "resolved"]),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type MaintenanceRequestInput = z.infer<typeof maintenanceRequestSchema>;
