"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { seedDefaultSettings } from "@/lib/settings";
import { notifyAdmins } from "@/lib/notify";
import type { ActionResponse } from "@/types";

export async function updateSettings(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const entries = Array.from(formData.entries());

    for (const [key, value] of entries) {
      if (key.startsWith("_")) continue;

      const setting = await prisma.setting.findUnique({ where: { key } });
      if (!setting) continue;

      let validatedValue = value as string;

      if (setting.type === "number") {
        const num = Number(value);
        if (isNaN(num) || num < 1) {
          return {
            error: `${setting.label} harus berupa angka positif`,
            toast: {
              title: "Error",
              description: `${setting.label} harus berupa angka positif`,
              type: "error",
            },
          };
        }
        validatedValue = String(num);
      }

      if (setting.type === "boolean") {
        validatedValue = value === "on" ? "true" : "false";
      }

      await prisma.setting.update({
        where: { key },
        data: { value: validatedValue },
      });
    }

    revalidatePath("/dashboard");

    await notifyAdmins({
      title: "Pengaturan diupdate",
      message: "Pengaturan sistem telah diperbarui oleh admin",
      type: "INFO",
      category: "SETTINGS",
    });

    return {
      success: true,
      toast: { title: "Berhasil", description: "Pengaturan telah disimpan", type: "success" },
    };
  } catch {
    return {
      error: "Gagal menyimpan pengaturan",
      toast: { title: "Error", description: "Gagal menyimpan pengaturan", type: "error" },
    };
  }
}

export async function resetSettings(): Promise<ActionResponse> {
  try {
    await seedDefaultSettings();
    revalidatePath("/dashboard");

    await notifyAdmins({
      title: "Pengaturan direset",
      message: "Pengaturan sistem telah direset ke default oleh admin",
      type: "WARNING",
      category: "SETTINGS",
    });

    return {
      success: true,
      toast: { title: "Berhasil", description: "Pengaturan telah direset ke default", type: "success" },
    };
  } catch {
    return {
      error: "Gagal mereset pengaturan",
      toast: { title: "Error", description: "Gagal mereset pengaturan", type: "error" },
    };
  }
}
