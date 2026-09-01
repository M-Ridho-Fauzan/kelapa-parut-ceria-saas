"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface SidebarRightContextType {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  isMobile: boolean
}

const SidebarRightContext = React.createContext<SidebarRightContextType>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
  isMobile: false,
})

export function useSidebarRight() {
  return React.useContext(SidebarRightContext)
}

export function SidebarRightProvider({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(defaultOpen)

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  return (
    <SidebarRightContext.Provider value={{ open, setOpen, toggle, isMobile }}>
      {children}
    </SidebarRightContext.Provider>
  )
}
