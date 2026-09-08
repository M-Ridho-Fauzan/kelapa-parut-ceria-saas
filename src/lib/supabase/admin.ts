import { createClient } from "@supabase/supabase-js";

/**
 * SECURITY: Supabase Admin Client — uses SERVICE_ROLE_KEY.
 *
 * WARNING: This client bypasses ALL Row Level Security (RLS) policies.
 * It has full read/write access to ALL tables and ALL user data.
 *
 * RULES:
 * 1. NEVER import this in client components ("use client").
 * 2. NEVER use this for regular user operations — use createClient() instead.
 * 3. ONLY use this for admin operations: create/delete users, manage auth.
 * 4. ALWAYS check auth + requireAdmin() BEFORE calling this.
 * 5. The SERVICE_ROLE_KEY must NEVER be exposed to the browser.
 *
 * If you're unsure whether to use this, you probably shouldn't.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
