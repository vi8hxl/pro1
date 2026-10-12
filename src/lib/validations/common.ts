import { z } from "zod";

export const uuidSchema = z.string().uuid("Must be a valid id");

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD");

/** Indian mobile number: optional +91 prefix, 10 digits starting 6-9. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91[-\s]?)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const moneySchema = z.coerce
  .number()
  .min(0, "Amount cannot be negative")
  .max(100_000_000, "Amount is too large");

export const localeSchema = z.enum(["en", "hi"]);

export const paymentModeSchema = z.enum(["cash", "upi", "bank", "other"]);

export const roleSchema = z.enum(["owner", "tenant"]);
