"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  AuthError,
  isValidEmail,
  isValidPassword,
} from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { randomBytes, scrypt } from "crypto";
import { notifyAdmins } from "@/lib/notify";
import type { ActionResponse } from "@/types";

const SALT_LENGTH = 16;
const SCRYPT_KEY_LENGTH = 64;

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(SALT_LENGTH).toString("hex");
    scrypt(password, salt, SCRYPT_KEY_LENGTH, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

const REQUEST_EXPIRY_DAYS = 7;

function markExpiredRequests() {
  return prisma.registrationRequest.updateMany({
    where: {
      status: "PENDING",
      createdAt: {
        lt: new Date(Date.now() - REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      },
    },
    data: { status: "EXPIRED" },
  });
}

export async function submitRegistrationRequest(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  const name = (formData.get("name") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!email) {
    return {
      error: "Email wajib diisi",
      toast: { title: "Gagal", description: "Email wajib diisi", type: "error" },
    };
  }

  if (!isValidEmail(email)) {
    return {
      error: "Format email tidak valid",
      toast: {
        title: "Gagal",
        description: "Format email tidak valid",
        type: "error",
      },
    };
  }

  if (!password) {
    return {
      error: "Password wajib diisi",
      toast: {
        title: "Gagal",
        description: "Password wajib diisi",
        type: "error",
      },
    };
  }

  const passwordCheck = isValidPassword(password);
  if (!passwordCheck.valid) {
    return {
      error: passwordCheck.message!,
      toast: { title: "Gagal", description: passwordCheck.message!, type: "error" },
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Password tidak cocok",
      toast: {
        title: "Gagal",
        description: "Password tidak cocok",
        type: "error",
      },
    };
  }

  const existingRequest = await prisma.registrationRequest.findUnique({
    where: { email },
  });

  if (existingRequest && existingRequest.status === "PENDING") {
    return {
      error: "Email sudah terdaftar dalam antrian",
      toast: {
        title: "Gagal",
        description: "Email sudah terdaftar dalam antrian",
        type: "error",
      },
    };
  }

  if (existingRequest && existingRequest.status === "APPROVED") {
    return {
      error: "Email sudah disetujui, silakan login",
      toast: {
        title: "Gagal",
        description: "Email sudah disetujui, silakan login",
        type: "error",
      },
    };
  }

  const adminSupabase = createAdminClient();
  const { data: existingAuthUsers } =
    await adminSupabase.auth.admin.listUsers();

  if (existingAuthUsers?.users?.some((u) => u.email === email)) {
    return {
      error: "Email sudah terdaftar",
      toast: {
        title: "Gagal",
        description: "Email sudah terdaftar",
        type: "error",
      },
    };
  }

  const hashedPassword = await hashPassword(password);

  await markExpiredRequests();

  await prisma.registrationRequest.upsert({
    where: { email },
    create: {
      email,
      name,
      password: hashedPassword,
      status: "PENDING",
    },
    update: {
      name,
      password: hashedPassword,
      status: "PENDING",
      reason: null,
      reviewedBy: null,
      reviewedAt: null,
    },
  });

  await notifyAdmins({
    title: "Permintaan registrasi baru",
    message: `${name || email} telah mengajukan permintaan pendaftaran`,
    type: "INFO",
    category: "REGISTRATION",
    actionUrl: "/dashboard/admin/users",
  });

  return {
    success: true,
    toast: {
      title: "Registrasi berhasil",
      description: "Permintaan pendaftaran kamu akan ditinjau oleh admin",
      type: "success",
    },
  };
}

export async function approveRegistrationRequest(
  requestId: string,
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

    const request = await prisma.registrationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return {
        error: "Request tidak ditemukan",
        toast: {
          title: "Gagal",
          description: "Request tidak ditemukan",
          type: "error",
        },
      };
    }

    if (request.status !== "PENDING") {
      return {
        error: "Request sudah diproses",
        toast: {
          title: "Gagal",
          description: "Request sudah diproses",
          type: "error",
        },
      };
    }

    const plainPassword = `${request.email}Temp!${Date.now()}`;

    const adminSupabase = createAdminClient();
    const { data: newAuthUser, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email: request.email,
        password: plainPassword,
        email_confirm: true,
        user_metadata: { name: request.name },
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
        email: request.email,
        name: request.name,
        role: "USER",
      },
    });

    await adminSupabase.auth.admin.inviteUserByEmail(request.email, {
      data: { name: request.name },
    });

    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedBy: adminUser.id,
        reviewedAt: new Date(),
      },
    });

    await notifyAdmins({
      title: "Registrasi disetujui",
      message: `Admin telah menyetujui pendaftaran ${request.email}`,
      type: "SUCCESS",
      category: "REGISTRATION",
      excludeUserIds: [user.id],
    });

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      toast: {
        title: "User berhasil disetujui",
        description: `${request.email} telah ditambahkan`,
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

export async function rejectRegistrationRequest(
  requestId: string,
  reason: string,
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

    const request = await prisma.registrationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return {
        error: "Request tidak ditemukan",
        toast: {
          title: "Gagal",
          description: "Request tidak ditemukan",
          type: "error",
        },
      };
    }

    if (request.status !== "PENDING") {
      return {
        error: "Request sudah diproses",
        toast: {
          title: "Gagal",
          description: "Request sudah diproses",
          type: "error",
        },
      };
    }

    if (!reason?.trim()) {
      return {
        error: "Alasan wajib diisi",
        toast: {
          title: "Gagal",
          description: "Alasan penolakan wajib diisi",
          type: "error",
        },
      };
    }

    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        reason: reason.trim(),
        reviewedBy: adminUser.id,
        reviewedAt: new Date(),
      },
    });

    await notifyAdmins({
      title: "Registrasi ditolak",
      message: `Admin telah menolak pendaftaran ${request.email}. Alasan: ${reason.trim()}`,
      type: "WARNING",
      category: "REGISTRATION",
      excludeUserIds: [user.id],
    });

    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      toast: {
        title: "Request ditolak",
        description: `${request.email} telah ditolak`,
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

export async function getPendingRequestCount(): Promise<number> {
  await markExpiredRequests();
  return prisma.registrationRequest.count({
    where: { status: "PENDING" },
  });
}

export async function getRegistrationRequests(status?: string) {
  await markExpiredRequests();

  const where = status && status !== "ALL"
    ? { status: status as import("@prisma/client").RegistrationStatus }
    : {};

  return prisma.registrationRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      reason: true,
      reviewedAt: true,
      createdAt: true,
    },
  });
}
