import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

/**
 * SECURITY: Route protection middleware.
 *
 * IMPORTANT: This is the ONLY line of defense for UI routes.
 * Server actions (src/app/actions/*) must ALSO check auth internally
 * because they can be called directly via POST, bypassing this proxy.
 *
 * Auth check pattern for server actions:
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   if (!user) return { error: "Unauthorized" };
 *   await requireAdmin(user.id); // for admin-only actions
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Apply security headers to all responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isLogin = request.nextUrl.pathname === "/login";
  const isRegister = request.nextUrl.pathname === "/register";

  if (isDashboard && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLogin && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isRegister && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboard && user) {
    if (user.email_confirmed_at === null) {
      const emailParam = encodeURIComponent(user.email || "");
      return NextResponse.redirect(
        new URL(`/auth/verify-email?email=${emailParam}`, request.url),
      );
    }

    if (request.nextUrl.pathname.startsWith("/dashboard/admin")) {
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
      });

      if (!dbUser || dbUser.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (dbUser.role === "ADMIN" && dbUser.totpEnabled) {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (aalData?.currentLevel !== "aal2") {
          return NextResponse.redirect(
            new URL("/auth/totp-verify", request.url),
          );
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
