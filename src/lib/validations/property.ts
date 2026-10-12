import { z } from "zod";
import { moneySchema, uuidSchema } from "./common";

export const buildingSchema = z.object({
  name: z.string().trim().min(1, "Give the building a name").max(120),
  address: z.string().trim().max(240).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const buildingUpdateSchema = buildingSchema.partial().extend({
  id: uuidSchema,
});

export const apartmentSchema = z.object({
  building_id: uuidSchema,
  label: z.string().trim().min(1, "Enter a flat number or name").max(40),
  floor: z.coerce.number().int().min(-5).max(200).optional(),
  base_rent: moneySchema,
  security_deposit: moneySchema.default(0),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const apartmentUpdateSchema = apartmentSchema.partial().extend({
  id: uuidSchema,
});

export type BuildingInput = z.infer<typeof buildingSchema>;
export type ApartmentInput = z.infer<typeof apartmentSchema>;
