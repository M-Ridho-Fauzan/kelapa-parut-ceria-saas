import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

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
 * Require the user to be an admin. Throws AuthError if not.
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
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength.
 */
export function isValidPassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 6) {
    return { valid: false, message: "Password minimal 6 karakter" };
  }
  return { valid: true };
}
