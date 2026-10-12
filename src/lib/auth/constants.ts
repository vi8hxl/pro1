/** Phone OTP is wired but off until a Twilio sender is configured. */
export const PHONE_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_PHONE_AUTH_ENABLED === "true";
