"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

const STORAGE_KEY = "sidebar-left-width"
const DEFAULT_WIDTH = 256
const MIN_WIDTH = 200
const MAX_WIDTH = 400

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
  // localStorage doesn't have native events, so we use a storage event listener
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback()
  }
  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}

interface SidebarLeftContextType {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  isMobile: boolean
  width: number
  setWidth: (width: number) => void
  isResizing: boolean
  setIsResizing: (resizing: boolean) => void
  minWidth: number
  maxWidth: number
}

const SidebarLeftContext = React.createContext<SidebarLeftContextType>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
  isMobile: false,
  width: DEFAULT_WIDTH,
  setWidth: () => {},
  isResizing: false,
  setIsResizing: () => {},
  minWidth: MIN_WIDTH,
  maxWidth: MAX_WIDTH,
})

export function useSidebarLeft() {
  return React.useContext(SidebarLeftContext)
}

export function SidebarLeftProvider({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(defaultOpen)
  const [isResizing, setIsResizing] = React.useState(false)

  const width = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setWidth = React.useCallback((newWidth: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(newWidth))
    }
    // Trigger re-render by dispatching a storage event
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }))
  }, [])

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      isMobile,
      width,
      setWidth,
      isResizing,
      setIsResizing,
      minWidth: MIN_WIDTH,
      maxWidth: MAX_WIDTH,
    }),
    [open, isMobile, width, isResizing, setWidth, toggle],
  )

  return (
    <SidebarLeftContext.Provider value={value}>
      {children}
    </SidebarLeftContext.Provider>
  )
}
