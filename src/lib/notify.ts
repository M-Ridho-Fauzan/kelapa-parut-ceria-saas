import { prisma } from "@/lib/prisma";
import type { NotificationType, NotificationCategory } from "@prisma/client";

interface NotifyParams {
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  actionUrl?: string;
  metadata?: string;
  excludeUserIds?: string[];
}

/**
 * Create notifications for all admin users (except excluded ones).
 * Use this in server actions to broadcast admin notifications.
 */
export async function notifyAdmins(params: NotifyParams) {
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      id: params.excludeUserIds?.length
        ? { notIn: params.excludeUserIds }
        : undefined,
    },
    select: { id: true },
  });

  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      title: params.title,
      message: params.message,
      type: params.type ?? "INFO",
      category: params.category ?? "SYSTEM",
      actionUrl: params.actionUrl ?? null,
      metadata: params.metadata ?? null,
      userId: admin.id,
    })),
  });
}

/**
 * Create a notification for a specific user.
 */
export async function notifyUser(
  userId: string,
  params: NotifyParams,
) {
  await prisma.notification.create({
    data: {
      title: params.title,
      message: params.message,
      type: params.type ?? "INFO",
      category: params.category ?? "SYSTEM",
      actionUrl: params.actionUrl ?? null,
      metadata: params.metadata ?? null,
      userId,
    },
  });
}
