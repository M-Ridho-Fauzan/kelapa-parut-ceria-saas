"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AuthError, isValidEmail, isValidPassword } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notifyAdmins } from "@/lib/notify";
import type { ActionResponse } from "@/types";

export async function signIn(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (error) {
      return {
        error: error.message,
        toast: { title: "Login gagal", description: error.message, type: "error" },
      };
    }

    const rememberMe = formData.get("remember_me") === "on";

    if (!rememberMe) {
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      const authCookie = allCookies.find(
        (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"),
      );

      if (authCookie) {
        cookieStore.set(authCookie.name, authCookie.value, {
          maxAge: 60 * 60,
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        });
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const existingUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            supabaseId: user.id,
            email: user.email!,
            name: user.user_metadata?.name || null,
            role: "USER",
          },
        });
      }
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("[auth/signIn]", err);
    return {
      error: "Terjadi kesalahan saat login",
      toast: { title: "Error", description: "Terjadi kesalahan saat login", type: "error" },
    };
  }
}

export async function createUser(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    await requireAdmin(user.id);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!email || !isValidEmail(email)) {
      return {
        error: "Email tidak valid",
        toast: { title: "Gagal", description: "Format email tidak valid", type: "error" },
      };
    }

    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      return {
        error: passwordCheck.message!,
        toast: { title: "Gagal", description: passwordCheck.message!, type: "error" },
      };
    }

    const adminSupabase = createAdminClient();
    const { data: newAuthUser, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

    if (createError) {
      return {
        error: createError.message,
        toast: {
          title: "Gagal membuat user",
          description: createError.message,
          type: "error",
        },
      };
    }

    await prisma.user.create({
      data: {
        supabaseId: newAuthUser.user.id,
        email,
        name,
        role: "USER",
      },
    });

    await notifyAdmins({
      title: "User baru dibuat",
      message: `Admin telah membuat user baru: ${email}`,
      type: "SUCCESS",
      category: "USER_MANAGEMENT",
      excludeUserIds: [user.id],
    });

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      toast: {
        title: "User berhasil dibuat",
        description: `${email} telah ditambahkan`,
        type: "success",
      },
    };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        error: err.message,
        toast: {
          title: "Akses ditolak",
          description: err.message,
          type: "error",
        },
      };
    }
    throw err;
  }
}

export async function signOut() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/");
    }

    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("[auth/signOut]", err);
    redirect("/");
  }
}

export async function updateUser(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    await requireAdmin(user.id);

    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as "ADMIN" | "USER";

    if (!userId || !email) {
      return {
        error: "Data tidak lengkap",
        toast: { title: "Gagal", description: "Data tidak lengkap", type: "error" },
      };
    }

    if (!isValidEmail(email)) {
      return {
        error: "Email tidak valid",
        toast: { title: "Gagal", description: "Format email tidak valid", type: "error" },
      };
    }

    if (role !== "ADMIN" && role !== "USER") {
      return {
        error: "Role tidak valid",
        toast: { title: "Gagal", description: "Role harus ADMIN atau USER", type: "error" },
      };
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return {
        error: "User tidak ditemukan",
        toast: { title: "Gagal", description: "User tidak ditemukan", type: "error" },
      };
    }

    if (existingUser.email !== email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return {
          error: "Email sudah digunakan",
          toast: { title: "Gagal", description: "Email sudah digunakan", type: "error" },
        };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name: name || null, email, role },
    });

    if (existingUser.email !== email) {
      const adminSupabase = createAdminClient();
      await adminSupabase.auth.admin.updateUserById(existingUser.supabaseId, {
        email,
        user_metadata: { name },
      });
    }

    await notifyAdmins({
      title: "User diupdate",
      message: `Data user ${email} telah diperbarui oleh admin`,
      type: "INFO",
      category: "USER_MANAGEMENT",
      excludeUserIds: [user.id],
    });

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      toast: {
        title: "User berhasil diupdate",
        description: `${email} telah diperbarui`,
        type: "success",
      },
    };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        error: err.message,
        toast: { title: "Akses ditolak", description: err.message, type: "error" },
      };
    }
    throw err;
  }
}

export async function deleteUser(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const adminUser = await requireAdmin(user.id);

    const userId = formData.get("userId") as string;

    if (!userId) {
      return {
        error: "User ID tidak valid",
        toast: { title: "Gagal", description: "User ID tidak valid", type: "error" },
      };
    }

    if (userId === adminUser.id) {
      return {
        error: "Tidak bisa menghapus akun sendiri",
        toast: {
          title: "Gagal",
          description: "Tidak bisa menghapus akun sendiri",
          type: "error",
        },
      };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return {
        error: "User tidak ditemukan",
        toast: { title: "Gagal", description: "User tidak ditemukan", type: "error" },
      };
    }

    const adminSupabase = createAdminClient();
    await adminSupabase.auth.admin.deleteUser(targetUser.supabaseId);

    await prisma.user.delete({ where: { id: userId } });

    await notifyAdmins({
      title: "User dihapus",
      message: `User ${targetUser.email} telah dihapus oleh admin`,
      type: "WARNING",
      category: "USER_MANAGEMENT",
      excludeUserIds: [user.id],
    });

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      toast: {
        title: "User berhasil dihapus",
        description: `${targetUser.email} telah dihapus`,
        type: "success",
      },
    };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        error: err.message,
        toast: { title: "Akses ditolak", description: err.message, type: "error" },
      };
    }
    throw err;
  }
}

export async function getUsers(search?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError(401, "Unauthorized");
  }

  await requireAdmin(user.id);

  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
}
