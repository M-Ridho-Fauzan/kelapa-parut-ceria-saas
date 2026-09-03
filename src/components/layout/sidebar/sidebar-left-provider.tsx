"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface SidebarLeftContextType {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  isMobile: boolean
}

const SidebarLeftContext = React.createContext<SidebarLeftContextType>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
  isMobile: false,
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

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  return (
    <SidebarLeftContext.Provider value={{ open, setOpen, toggle, isMobile }}>
      {children}
    </SidebarLeftContext.Provider>
  )
}
