"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { IconDashboard, IconCalendar, IconBell, IconSettings } from "@tabler/icons-react"
import type { TablerIcon } from "@tabler/icons-react"

export interface RightSidebarNavItem {
  id: string
  icon: TablerIcon
  title: string
}

export const rightSidebarNavItems: RightSidebarNavItem[] = [
  { id: "quick-info", icon: IconDashboard, title: "Info Cepat" },
  { id: "calendar", icon: IconCalendar, title: "Kalender" },
  { id: "notifications", icon: IconBell, title: "Notifikasi" },
  { id: "settings", icon: IconSettings, title: "Pengaturan" },
]

const STORAGE_KEY = "sidebar-right-width"
const DEFAULT_WIDTH = 320
const MIN_WIDTH = 240
const MAX_WIDTH = 480

function getSnapshot(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const parsed = Number(saved)
    if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
      return parsed
    }
  }
  return DEFAULT_WIDTH
}

function getServerSnapshot(): number {
  return DEFAULT_WIDTH
}

function subscribe(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback()
  }
  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}

interface SidebarRightContextType {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  isMobile: boolean
  activeItem: RightSidebarNavItem
  setActiveItem: (item: RightSidebarNavItem) => void
  width: number
  setWidth: (width: number) => void
  isResizing: boolean
  setIsResizing: (v: boolean) => void
  minWidth: number
  maxWidth: number
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
  minWidth: MIN_WIDTH,
  maxWidth: MAX_WIDTH,
})

export function useSidebarRight() {
  return React.useContext(SidebarRightContext)
}

export function SidebarRightProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(defaultOpen)
  const [activeItem, setActiveItem] = React.useState<RightSidebarNavItem>(
    rightSidebarNavItems[0],
  )
  const [isResizing, setIsResizing] = React.useState(false)

  const width = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const setWidth = React.useCallback((newWidth: number) => {
    const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth))
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(clamped))
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }))
    }
  }, [])

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
        minWidth: MIN_WIDTH,
        maxWidth: MAX_WIDTH,
      }}
    >
      {children}
    </SidebarRightContext.Provider>
  )
}
