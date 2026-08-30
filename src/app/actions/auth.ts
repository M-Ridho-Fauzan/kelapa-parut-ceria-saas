"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function signIn(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
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

  const { data: { user } } = await supabase.auth.getUser();

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
}

export async function createUser(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return {
      error: "Forbidden: Admin only",
      toast: {
        title: "Akses ditolak",
        description: "Hanya admin yang bisa membuat user",
        type: "error",
      },
    };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

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

  revalidatePath("/dashboard/admin/users");
  return {
    success: true,
    toast: {
      title: "User berhasil dibuat",
      description: `${email} telah ditambahkan`,
      type: "success",
    },
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
