"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function checkEmailVerified(): Promise<{
  verified: boolean;
  email: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { verified: false, email: null };
    }

    return {
      verified: user.email_confirmed_at !== null,
      email: user.email || null,
    };
  } catch {
    return { verified: false, email: null };
  }
}

export async function checkTotpStatus(): Promise<{
  totpEnabled: boolean;
  emailVerified: boolean;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { totpEnabled: false, emailVerified: false };
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { totpEnabled: true },
    });

    return {
      totpEnabled: dbUser?.totpEnabled || false,
      emailVerified: user.email_confirmed_at !== null,
    };
  } catch {
    return { totpEnabled: false, emailVerified: false };
  }
}

export async function enrollTotp(): Promise<
  ActionResponse & { qrCode?: string; secret?: string; factorId?: string }
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator App",
    });

    if (error) {
      return {
        error: error.message,
        toast: { title: "Error", description: error.message, type: "error" },
      };
    }

    return {
      success: true,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id,
      toast: {
        title: "Berhasil",
        description: "Scan QR code dengan authenticator app",
        type: "success",
      },
    };
  } catch {
    return {
      error: "Gagal memulai setup TOTP",
      toast: { title: "Error", description: "Gagal memulai setup TOTP", type: "error" },
    };
  }
}

export async function verifyTotpSetup(
  factorId: string,
  code: string,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      return {
        error: challengeError.message,
        toast: { title: "Error", description: challengeError.message, type: "error" },
      };
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      return {
        error: verifyError.message,
        toast: { title: "Error", description: verifyError.message, type: "error" },
      };
    }

    await prisma.user.update({
      where: { supabaseId: user.id },
      data: { totpEnabled: true },
    });

    revalidatePath("/", "layout");
    return {
      success: true,
      toast: {
        title: "Berhasil",
        description: "TOTP telah diaktifkan",
        type: "success",
      },
    };
  } catch {
    return {
      error: "Gagal memverifikasi TOTP",
      toast: { title: "Error", description: "Gagal memverifikasi TOTP", type: "error" },
    };
  }
}

export async function verifyTotpLogin(
  code: string,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const { data: factorsData, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError) {
      return {
        error: factorsError.message,
        toast: { title: "Error", description: factorsError.message, type: "error" },
      };
    }

    const totpFactor = factorsData.totp?.[0];
    if (!totpFactor) {
      return {
        error: "TOTP tidak ditemukan",
        toast: { title: "Error", description: "TOTP tidak ditemukan", type: "error" },
      };
    }

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: totpFactor.id });

    if (challengeError) {
      return {
        error: challengeError.message,
        toast: { title: "Error", description: challengeError.message, type: "error" },
      };
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      return {
        error: verifyError.message,
        toast: { title: "Error", description: verifyError.message, type: "error" },
      };
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      toast: {
        title: "Berhasil",
        description: "TOTP berhasil diverifikasi",
        type: "success",
      },
    };
  } catch {
    return {
      error: "Gagal memverifikasi TOTP",
      toast: { title: "Error", description: "Gagal memverifikasi TOTP", type: "error" },
    };
  }
}

export async function toggleTotp(
  enable: boolean,
): Promise<ActionResponse> {
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
      select: { totpEnabled: true },
    });

    if (!dbUser) {
      return { error: "User tidak ditemukan" };
    }

    if (enable) {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.totp?.[0];

      if (!totpFactor) {
        return {
          error: "Setup TOTP terlebih dahulu",
          toast: {
            title: "Error",
            description: "Setup TOTP terlebih dahulu dari menu Keamanan",
            type: "error",
          },
        };
      }

      await prisma.user.update({
        where: { supabaseId: user.id },
        data: { totpEnabled: true },
      });
    } else {
      await prisma.user.update({
        where: { supabaseId: user.id },
        data: { totpEnabled: false },
      });
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      toast: {
        title: "Berhasil",
        description: enable
          ? "TOTP telah diaktifkan"
          : "TOTP telah dinonaktifkan",
        type: "success",
      },
    };
  } catch {
    return {
      error: "Gagal mengubah status TOTP",
      toast: {
        title: "Error",
        description: "Gagal mengubah status TOTP",
        type: "error",
      },
    };
  }
}
