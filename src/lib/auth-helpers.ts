import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Custom error class for authentication/authorization errors.
 * THROWS with HTTP status code — caller must handle with try/catch.
 *
 * IMPORTANT: In server actions, always catch AuthError separately:
 *   catch (err) {
 *     if (err instanceof AuthError) {
 *       return { error: err.message, toast: { ... } };
 *     }
 *     throw err; // re-throw unexpected errors
 *   }
 */
export class AuthError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Require the user to be an admin. Throws AuthError(403) if not.
 *
 * SECURITY: This function MUST be called at the start of every
 * admin-only server action. The proxy (middleware) only protects
 * the UI routes — server actions can be called directly via POST.
 *
 * Usage:
 *   const dbUser = await requireAdmin(supabaseUserId);
 *   // dbUser is guaranteed to be an ADMIN User object
 */
export async function requireAdmin(supabaseUserId: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUserId },
  });

  if (!user || user.role !== "ADMIN") {
    throw new AuthError(403, "Hanya admin yang bisa melakukan aksi ini");
  }

  return user;
}

/**
 * Check if user is admin without throwing.
 */
export async function isAdmin(supabaseUserId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUserId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

/**
 * Validate email format.
 * Use this before any database operation involving email.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength.
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number.
 *
 * IMPORTANT: If you change these requirements, update the error
 * messages to match and inform users about new requirements.
 */
export function isValidPassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, message: "Password minimal 8 karakter" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password harus mengandung minimal 1 huruf besar" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password harus mengandung minimal 1 huruf kecil" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password harus mengandung minimal 1 angka" };
  }
  return { valid: true };
}
