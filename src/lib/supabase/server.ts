import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAuthSettings } from "@/lib/settings";

export async function createClient() {
  const cookieStore = await cookies();
  const auth = await getAuthSettings();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: auth.sessionExpiryHours * 60 * 60,
        secure: auth.cookieSecure,
        httpOnly: auth.cookieHttpOnly,
        sameSite: "lax",
        path: "/",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // ignore errors in Server Components (read-only)
          }
        },
      },
    },
  );
}
