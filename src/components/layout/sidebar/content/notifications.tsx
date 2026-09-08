"use client";

import * as React from "react";
import {
  IconBell,
  IconBellFilled,
  IconCheck,
  IconTrash,
  IconUserPlus,
  IconUserCheck,
  IconLock,
  IconSettings,
  IconInfoCircle,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertOctagon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/app/actions/notification";
import { useSidebarRight } from "@/components/layout/sidebar/sidebar-right-provider";
import type {
  Notification,
  NotificationType,
  NotificationCategory,
} from "@prisma/client";

const typeConfig: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  INFO: { icon: IconInfoCircle, color: "text-blue-500" },
  SUCCESS: { icon: IconCircleCheck, color: "text-green-500" },
  WARNING: { icon: IconAlertTriangle, color: "text-yellow-500" },
  ERROR: { icon: IconAlertOctagon, color: "text-red-500" },
};

const categoryConfig: Record<
  NotificationCategory,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  USER_MANAGEMENT: { icon: IconUserPlus, label: "User" },
  REGISTRATION: { icon: IconUserCheck, label: "Registrasi" },
  SECURITY: { icon: IconLock, label: "Keamanan" },
  SETTINGS: { icon: IconSettings, label: "Pengaturan" },
  SYSTEM: { icon: IconBell, label: "Sistem" },
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}h lalu`;
  if (hours > 0) return `${hours}j lalu`;
  if (minutes > 0) return `${minutes}m lalu`;
  return "Baru saja";
}

export function NotificationsContent() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { refreshUnreadCount } = useSidebarRight();
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    getNotifications(50)
      .then((data) => {
        if (!cancelled && mountedRef.current) {
          setNotifications(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const handleMarkAsRead = React.useCallback(
    async (id: string) => {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      refreshUnreadCount();
    },
    [refreshUnreadCount],
  );

  const handleMarkAllAsRead = React.useCallback(async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const handleDelete = React.useCallback(
    async (id: string) => {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      refreshUnreadCount();
    },
    [refreshUnreadCount],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <IconBellFilled className="size-4" />
          <span className="text-sm font-semibold">Notifikasi</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconCheck className="size-3" />
            <span>Baca semua</span>
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <IconBell className="size-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Belum ada notifikasi
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => {
              const typeCfg = typeConfig[notification.type];
              const categoryCfg = categoryConfig[notification.category];
              const TypeIcon = typeCfg.icon;
              const CategoryIcon = categoryCfg.icon;

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                    !notification.read && "bg-muted/30",
                  )}
                >
                  {/* Unread dot */}
                  {!notification.read && (
                    <div className="absolute left-1.5 top-4 size-2 rounded-full bg-primary" />
                  )}

                  {/* Icon */}
                  <div className={cn("mt-0.5 shrink-0", typeCfg.color)}>
                    <CategoryIcon className="size-4" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          !notification.read
                            ? "font-medium"
                            : "text-muted-foreground",
                        )}
                      >
                        {notification.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          typeCfg.color,
                          "bg-current/10",
                        )}
                      >
                        <TypeIcon className="size-2.5" />
                        {typeCfg.color.replace("text-", "")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {categoryCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="rounded-md p-1 hover:bg-muted"
                        title="Tandai sudah dibaca"
                      >
                        <IconCheck className="size-3 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="rounded-md p-1 hover:bg-muted"
                      title="Hapus"
                    >
                      <IconTrash className="size-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
