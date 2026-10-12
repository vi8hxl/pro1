import { z } from "zod";
import { localeSchema, otpSchema, phoneSchema, roleSchema } from "./common";

export const phoneLoginSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  token: otpSchema,
});

export const emailLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export const emailSignupSchema = emailLoginSchema.extend({
  full_name: z.string().trim().min(2, "Enter your name").max(80),
});

/** Step 1 of signup: choose a role. */
export const chooseRoleSchema = z.object({
  role: roleSchema,
});

/** Step 2: complete the profile after OTP verification. */
export const completeProfileSchema = z.object({
  role: roleSchema,
  full_name: z.string().trim().min(2, "Enter your name").max(80),
  locale: localeSchema.default("en"),
  email: z.string().trim().email().optional().or(z.literal("")),
});

export const updateProfileSchema = z.object({
  full_name: z.string().trim().min(2).max(80).optional(),
  locale: localeSchema.optional(),
  currency: z.string().trim().length(3).optional(),
  grace_period_days: z.coerce.number().int().min(0).max(30).optional(),
});

export type PhoneLoginInput = z.infer<typeof phoneLoginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
export type EmailSignupInput = z.infer<typeof emailSignupSchema>;
export type ChooseRoleInput = z.infer<typeof chooseRoleSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
