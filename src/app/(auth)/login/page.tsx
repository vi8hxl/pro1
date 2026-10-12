import type { Metadata } from "next";
import { AuthComingSoon } from "@/components/auth/auth-coming-soon";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return <AuthComingSoon mode="login" />;
}
