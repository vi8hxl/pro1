import type { Metadata } from "next";
import { AuthComingSoon } from "@/components/auth/auth-coming-soon";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return <AuthComingSoon mode="signup" />;
}
