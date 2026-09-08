"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { NotificationType, NotificationCategory } from "@prisma/client";

interface CreateNotificationParams {
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  actionUrl?: string;
  metadata?: string;
  targetUserIds?: string[];
}

export async function createNotification(params: CreateNotificationParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser) return;

  // If targetUserIds provided, send to those users; otherwise send to all admins
  let recipientIds: string[] = [];

  if (params.targetUserIds && params.targetUserIds.length > 0) {
    recipientIds = params.targetUserIds;
  } else {
    // Default: notify all admins (excluding the actor)
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", id: { not: dbUser.id } },
      select: { id: true },
    });
    recipientIds = admins.map((a) => a.id);
  }

  if (recipientIds.length === 0) return;

  await prisma.notification.createMany({
    data: recipientIds.map((userId) => ({
      title: params.title,
      message: params.message,
      type: params.type ?? "INFO",
      category: params.category ?? "SYSTEM",
      actionUrl: params.actionUrl ?? null,
      metadata: params.metadata ?? null,
      userId,
    })),
  });

  revalidatePath("/", "layout");
}

export async function getNotifications(limit = 50) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser) return [];

  return prisma.notification.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser) return 0;

  return prisma.notification.count({
    where: { userId: dbUser.id, read: false },
  });
}

export async function markAsRead(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser) return;

  await prisma.notification.updateMany({
    where: { id, userId: dbUser.id },
    data: { read: true },
  });

  revalidatePath("/", "layout");
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser) return;

  await prisma.notification.updateMany({
    where: { userId: dbUser.id, read: false },
    data: { read: true },
  });

  revalidatePath("/", "layout");
}

export async function deleteNotification(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser) return;

  await prisma.notification.deleteMany({
    where: { id, userId: dbUser.id },
  });

  revalidatePath("/", "layout");
}
