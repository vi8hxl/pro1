import { z } from "zod";
import { isoDateSchema, moneySchema, uuidSchema } from "./common";

export const createTenancySchema = z.object({
  apartment_id: uuidSchema,
  tenant_name: z.string().trim().min(2, "Enter the tenant's name").max(80),
  tenant_phone: z.string().trim().max(20).optional().or(z.literal("")),
  tenant_email: z.string().trim().email().optional().or(z.literal("")),
  move_in_date: isoDateSchema,
  rent_amount: moneySchema.refine((v) => v > 0, "Rent must be more than 0"),
  due_day: z.coerce.number().int().min(1).max(28).default(1),
  deposit_amount: moneySchema.default(0),
});

export const updateTenancySchema = z.object({
  id: uuidSchema,
  tenant_name: z.string().trim().min(2).max(80).optional(),
  tenant_phone: z.string().trim().max(20).optional().or(z.literal("")),
  tenant_email: z.string().trim().email().optional().or(z.literal("")),
  due_day: z.coerce.number().int().min(1).max(28).optional(),
  deposit_amount: moneySchema.optional(),
});

/** Rent revision — stored in rent_history with an effective date. */
export const changeRentSchema = z.object({
  tenancy_id: uuidSchema,
  rent_amount: moneySchema.refine((v) => v > 0, "Rent must be more than 0"),
  effective_from: isoDateSchema,
  note: z.string().trim().max(200).optional().or(z.literal("")),
});

export const moveOutSchema = z.object({
  tenancy_id: uuidSchema,
  move_out_date: isoDateSchema,
  deposit_settled: moneySchema.optional(),
});

export type CreateTenancyInput = z.infer<typeof createTenancySchema>;
export type UpdateTenancyInput = z.infer<typeof updateTenancySchema>;
export type ChangeRentInput = z.infer<typeof changeRentSchema>;
export type MoveOutInput = z.infer<typeof moveOutSchema>;
