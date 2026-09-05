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

const STORAGE_KEY = "sidebar-right-width";
const DEFAULT_WIDTH = 320;
const MAX_WIDTH = 480;
const ABSOLUTE_MIN_WIDTH = 200;

function readStoredWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = Number(saved);
    if (!isNaN(parsed) && parsed >= ABSOLUTE_MIN_WIDTH && parsed <= MAX_WIDTH) {
      return parsed;
    }
  }
  return DEFAULT_WIDTH;
}

// useSyncExternalStore hooks for hydration-safe localStorage read
function getSnapshot() {
  return readStoredWidth();
}

function getServerSnapshot() {
  return DEFAULT_WIDTH;
}

function subscribe(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
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
});

export function useSidebarRight() {
  return React.useContext(SidebarRightContext);
}

export function SidebarRightProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(defaultOpen);
  const [activeItem, setActiveItem] = React.useState<RightSidebarNavItem>(
    rightSidebarNavItems[0],
  );
  const [isResizing, setIsResizing] = React.useState(false);

  // Read stored width from localStorage (hydration-safe via useSyncExternalStore)
  const storedWidth = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Compute effective width: stored width clamped to active content's minWidth
  const minWidth = activeItem.minWidth;
  const width = Math.max(storedWidth, minWidth);

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const setWidth = React.useCallback((newWidth: number) => {
    const clamped = Math.min(MAX_WIDTH, Math.max(ABSOLUTE_MIN_WIDTH, newWidth));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(clamped));
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    }
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
      }}
    >
      {children}
    </SidebarRightContext.Provider>
  );
}
