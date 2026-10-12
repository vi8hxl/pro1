import { NextResponse, type NextRequest } from "next/server";
import { getProfileGate } from "@/lib/services/profiles";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 renamed `middleware` to `proxy`. This file:
 *   1. refreshes the Supabase session on every request, and
 *   2. enforces role-based access (owners → /owner, tenants → /tenant).
 */

const AUTH_ROUTES = ["/login", "/signup"];
const PROTECTED_PREFIXES = ["/owner", "/tenant", "/account", "/onboarding"];

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Supabase not configured yet — let everything through so the marketing
  // site and setup instructions still render.
  if (!supabase) return response;

  const isAuthRoute = AUTH_ROUTES.some((route) => matches(pathname, route));
  const isOnboarding = matches(pathname, "/onboarding");
  const isProtected = PROTECTED_PREFIXES.some((route) => matches(pathname, route));

  if (!user) {
    return isProtected ? redirectTo(request, "/login") : response;
  }

  const gate = await getProfileGate(supabase, user.id);

  // Signed in but no role chosen yet (or profile missing) → finish setup.
  if (!gate || !gate.onboarded) {
    return isOnboarding ? response : redirectTo(request, "/onboarding");
  }

  const home = gate.role === "tenant" ? "/tenant" : "/owner";

  if (isAuthRoute || isOnboarding) return redirectTo(request, home);

  if (matches(pathname, "/owner") && gate.role !== "owner") {
    return redirectTo(request, home);
  }
  if (matches(pathname, "/tenant") && gate.role !== "tenant") {
    return redirectTo(request, home);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sw.js|offline.html|icons/|.*\\.(?:png|jpe?g|svg|ico|webp|css|js|mjs|txt|woff2?)$).*)",
  ],
};
