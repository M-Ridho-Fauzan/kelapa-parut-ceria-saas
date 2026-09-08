"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  IconDashboard,
  IconCalendar,
  IconBell,
  IconSettings,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";

export interface RightSidebarNavItem {
  id: string;
  icon: TablerIcon;
  title: string;
  /** Minimum width (px) when this content is active and sidebar is resized (desktop only) */
  minWidth: number;
}

export const rightSidebarNavItems: RightSidebarNavItem[] = [
  {
    id: "quick-info",
    icon: IconDashboard,
    title: "Info Cepat",
    minWidth: 240,
  },
  {
    id: "calendar",
    icon: IconCalendar,
    title: "Kalender",
    minWidth: 310,
  },
  {
    id: "notifications",
    icon: IconBell,
    title: "Notifikasi",
    minWidth: 260,
  },
  {
    id: "settings",
    icon: IconSettings,
    title: "Pengaturan",
    minWidth: 300,
  },
];

const WIDTH_STORAGE_KEY = "sidebar-right-width";
const OPEN_STORAGE_KEY = "sidebar-right-open";
const DEFAULT_WIDTH = 320;
const MAX_WIDTH = 480;
const ABSOLUTE_MIN_WIDTH = 200;

function readStoredWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  const saved = localStorage.getItem(WIDTH_STORAGE_KEY);
  if (saved) {
    const parsed = Number(saved);
    if (!isNaN(parsed) && parsed >= ABSOLUTE_MIN_WIDTH && parsed <= MAX_WIDTH) {
      return parsed;
    }
  }
  return DEFAULT_WIDTH;
}

function getSnapshot() {
  return readStoredWidth();
}

function getServerSnapshot() {
  return DEFAULT_WIDTH;
}

function getOpenSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem(OPEN_STORAGE_KEY);
  if (saved === "true") return true;
  if (saved === "false") return false;
  return false;
}

function getOpenServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === WIDTH_STORAGE_KEY || e.key === OPEN_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

interface SidebarRightContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  isMobile: boolean;
  activeItem: RightSidebarNavItem;
  setActiveItem: (item: RightSidebarNavItem) => void;
  width: number;
  setWidth: (width: number) => void;
  isResizing: boolean;
  setIsResizing: (v: boolean) => void;
  /** Minimum width based on active content */
  minWidth: number;
  maxWidth: number;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => void;
}

const SidebarRightContext = React.createContext<SidebarRightContextType>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
  isMobile: false,
  activeItem: rightSidebarNavItems[0],
  setActiveItem: () => {},
  width: DEFAULT_WIDTH,
  setWidth: () => {},
  isResizing: false,
  setIsResizing: () => {},
  minWidth: rightSidebarNavItems[0].minWidth,
  maxWidth: MAX_WIDTH,
  unreadCount: 0,
  setUnreadCount: () => {},
  refreshUnreadCount: () => {},
});

export function useSidebarRight() {
  return React.useContext(SidebarRightContext);
}

export function SidebarRightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [activeItem, setActiveItem] = React.useState<RightSidebarNavItem>(
    rightSidebarNavItems[0],
  );
  const [isResizing, setIsResizing] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const storedWidth = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const open = React.useSyncExternalStore(
    subscribe,
    getOpenSnapshot,
    getOpenServerSnapshot,
  );

  const minWidth = activeItem.minWidth;
  const width = Math.max(storedWidth, minWidth);

  const setOpen = React.useCallback((value: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(OPEN_STORAGE_KEY, String(value));
      window.dispatchEvent(new StorageEvent("storage", { key: OPEN_STORAGE_KEY }));
    }
  }, []);

  const toggle = React.useCallback(() => {
    if (typeof window !== "undefined") {
      const current = localStorage.getItem(OPEN_STORAGE_KEY) === "true";
      const next = !current;
      localStorage.setItem(OPEN_STORAGE_KEY, String(next));
      window.dispatchEvent(new StorageEvent("storage", { key: OPEN_STORAGE_KEY }));
    }
  }, []);

  const setWidth = React.useCallback((newWidth: number) => {
    const clamped = Math.min(MAX_WIDTH, Math.max(ABSOLUTE_MIN_WIDTH, newWidth));
    if (typeof window !== "undefined") {
      localStorage.setItem(WIDTH_STORAGE_KEY, String(clamped));
      window.dispatchEvent(new StorageEvent("storage", { key: WIDTH_STORAGE_KEY }));
    }
  }, []);

  const refreshUnreadCount = React.useCallback(() => {
    import("@/app/actions/notification")
      .then(({ getUnreadCount }) => getUnreadCount())
      .then(setUnreadCount)
      .catch(() => {});
  }, []);

  return (
    <SidebarRightContext.Provider
      value={{
        open,
        setOpen,
        toggle,
        isMobile,
        activeItem,
        setActiveItem,
        width,
        setWidth,
        isResizing,
        setIsResizing,
        minWidth,
        maxWidth: MAX_WIDTH,
        unreadCount,
        setUnreadCount,
        refreshUnreadCount,
      }}
    >
      {children}
    </SidebarRightContext.Provider>
  );
}
