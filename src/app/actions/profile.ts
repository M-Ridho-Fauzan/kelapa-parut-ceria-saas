"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { isValidEmail, isValidPassword } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function updateProfile(
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

    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
      return {
        error: "Nama harus diisi",
        toast: { title: "Error", description: "Nama harus diisi", type: "error" },
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { name: name.trim() },
    });

    if (updateError) {
      return {
        error: updateError.message,
        toast: { title: "Error", description: updateError.message, type: "error" },
      };
    }

    await prisma.user.update({
      where: { supabaseId: user.id },
      data: { name: name.trim() },
    });

    revalidatePath("/", "layout");
    return {
      success: true,
      toast: { title: "Berhasil", description: "Nama telah diperbarui", type: "success" },
    };
  } catch (err) {
    console.error("[profile/updateProfile]", err);
    return {
      error: "Gagal memperbarui profil",
      toast: { title: "Error", description: "Gagal memperbarui profil", type: "error" },
    };
  }
}

export async function updateEmail(
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

    const email = formData.get("email") as string;

    if (!email || email.trim().length === 0) {
      return {
        error: "Email harus diisi",
        toast: { title: "Error", description: "Email harus diisi", type: "error" },
      };
    }

    if (!isValidEmail(email.trim())) {
      return {
        error: "Format email tidak valid",
        toast: { title: "Error", description: "Format email tidak valid", type: "error" },
      };
    }

    if (email === user.email) {
      return {
        error: "Email sama dengan yang sebelumnya",
        toast: { title: "Error", description: "Email sama dengan yang sebelumnya", type: "error" },
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      email: email.trim(),
    });

    if (updateError) {
      return {
        error: updateError.message,
        toast: { title: "Error", description: updateError.message, type: "error" },
      };
    }

    return {
      success: true,
      toast: {
        title: "Verifikasi diperlukan",
        description: "Silakan cek email Anda untuk verifikasi perubahan email",
        type: "info",
      },
    };
  } catch (err) {
    console.error("[profile/updateEmail]", err);
    return {
      error: "Gagal memperbarui email",
      toast: { title: "Error", description: "Gagal memperbarui email", type: "error" },
    };
  }
}

export async function updatePassword(
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

    const currentPassword = formData.get("current_password") as string;
    const password = formData.get("password") as string;

    if (!currentPassword) {
      return {
        error: "Password saat ini wajib diisi",
        toast: {
          title: "Error",
          description: "Password saat ini wajib diisi",
          type: "error",
        },
      };
    }

    // Verify current password by attempting sign-in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      return {
        error: "Password saat ini salah",
        toast: {
          title: "Error",
          description: "Password saat ini salah",
          type: "error",
        },
      };
    }

    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      return {
        error: passwordCheck.message!,
        toast: { title: "Error", description: passwordCheck.message!, type: "error" },
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return {
        error: updateError.message,
        toast: { title: "Error", description: updateError.message, type: "error" },
      };
    }

    return {
      success: true,
      toast: { title: "Berhasil", description: "Password telah diperbarui", type: "success" },
    };
  } catch (err) {
    console.error("[profile/updatePassword]", err);
    return {
      error: "Gagal memperbarui password",
      toast: { title: "Error", description: "Gagal memperbarui password", type: "error" },
    };
  }
}

export async function uploadAvatar(
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

    const file = formData.get("avatar") as File;

    if (!file || file.size === 0) {
      return {
        error: "Pilih file gambar terlebih dahulu",
        toast: { title: "Error", description: "Pilih file gambar terlebih dahulu", type: "error" },
      };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        error: "Format file tidak didukung",
        toast: {
          title: "Error",
          description: "Format file harus JPEG, PNG, atau WebP",
          type: "error",
        },
      };
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return {
        error: "Ukuran file terlalu besar",
        toast: { title: "Error", description: "Ukuran file maksimal 2MB", type: "error" },
      };
    }

    // Map MIME type to extension (prevents path traversal via filename)
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const fileExt = mimeToExt[file.type];
    if (!fileExt) {
      return {
        error: "Format file tidak didukung",
        toast: { title: "Error", description: "Format file harus JPEG, PNG, atau WebP", type: "error" },
      };
    }
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      return {
        error: uploadError.message,
        toast: { title: "Error", description: uploadError.message, type: "error" },
      };
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    });

    if (updateError) {
      return {
        error: updateError.message,
        toast: { title: "Error", description: updateError.message, type: "error" },
      };
    }

    await prisma.user.update({
      where: { supabaseId: user.id },
      data: { avatar: avatarUrl },
    });

    revalidatePath("/", "layout");
    return {
      success: true,
      toast: { title: "Berhasil", description: "Avatar telah diperbarui", type: "success" },
    };
  } catch (err) {
    console.error("[profile/uploadAvatar]", err);
    return {
      error: "Gagal mengupload avatar",
      toast: { title: "Error", description: "Gagal mengupload avatar", type: "error" },
    };
  }
}

export async function signOutAllDevices(): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "global" });

    if (error) {
      return {
        error: error.message,
        toast: { title: "Error", description: error.message, type: "error" },
      };
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      toast: {
        title: "Berhasil",
        description: "Telah logout dari semua perangkat",
        type: "success",
      },
    };
  } catch (err) {
    console.error("[profile/signOutAllDevices]", err);
    return {
      error: "Gagal logout dari semua perangkat",
      toast: { title: "Error", description: "Gagal logout dari semua perangkat", type: "error" },
    };
  }
}

export async function deleteAccount(): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return { error: "User tidak ditemukan" };
    }

    if (dbUser.role === "ADMIN") {
      return {
        error: "Admin tidak bisa menghapus akun",
        toast: {
          title: "Error",
          description: "Admin tidak bisa menghapus akun sendiri",
          type: "error",
        },
      };
    }

    const adminSupabase = createAdminClient();
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
      user.id,
    );

    if (deleteError) {
      return {
        error: deleteError.message,
        toast: { title: "Error", description: deleteError.message, type: "error" },
      };
    }

    await prisma.user.delete({
      where: { supabaseId: user.id },
    });

    await supabase.auth.signOut({ scope: "global" });

    revalidatePath("/", "layout");
    return {
      success: true,
      toast: {
        title: "Berhasil",
        description: "Akun telah dihapus secara permanen",
        type: "success",
      },
    };
  } catch (err) {
    console.error("[profile/deleteAccount]", err);
    return {
      error: "Gagal menghapus akun",
      toast: { title: "Error", description: "Gagal menghapus akun", type: "error" },
    };
  }
}
