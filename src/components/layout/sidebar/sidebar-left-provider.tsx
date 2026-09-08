"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

const WIDTH_STORAGE_KEY = "sidebar-left-width"
const OPEN_STORAGE_KEY = "sidebar-left-open"
const DEFAULT_WIDTH = 256
const MIN_WIDTH = 200
const MAX_WIDTH = 400

function getSnapshot(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH
  const saved = localStorage.getItem(WIDTH_STORAGE_KEY)
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

function getOpenSnapshot(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(OPEN_STORAGE_KEY) === "true"
}

function getOpenServerSnapshot(): boolean {
  return false
}

function subscribe(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === WIDTH_STORAGE_KEY || e.key === OPEN_STORAGE_KEY) callback()
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
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [isResizing, setIsResizing] = React.useState(false)

  const width = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const open = React.useSyncExternalStore(subscribe, getOpenSnapshot, getOpenServerSnapshot)

  const setOpen = React.useCallback((value: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(OPEN_STORAGE_KEY, String(value))
      window.dispatchEvent(new StorageEvent("storage", { key: OPEN_STORAGE_KEY }))
    }
  }, [])

  const toggle = React.useCallback(() => {
    if (typeof window !== "undefined") {
      const current = localStorage.getItem(OPEN_STORAGE_KEY) === "true"
      const next = !current
      localStorage.setItem(OPEN_STORAGE_KEY, String(next))
      window.dispatchEvent(new StorageEvent("storage", { key: OPEN_STORAGE_KEY }))
    }
  }, [])

  const setWidth = React.useCallback((newWidth: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(WIDTH_STORAGE_KEY, String(newWidth))
    }
    window.dispatchEvent(new StorageEvent("storage", { key: WIDTH_STORAGE_KEY }))
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
    [open, isMobile, width, isResizing, setWidth, setOpen, toggle],
  )

  return (
    <SidebarLeftContext.Provider value={value}>
      {children}
    </SidebarLeftContext.Provider>
  )
}
