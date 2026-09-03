"use client"

import { Button } from "@/components/ui/button"
import { useSidebarLeft } from "@/components/layout/sidebar/sidebar-left-provider"
import { useSidebar } from "@/components/ui/sidebar"
import { IconLayoutSidebar } from "@tabler/icons-react"

export function SidebarLeftTrigger() {
  const { isMobile } = useSidebarLeft()
  const { toggleSidebar } = useSidebar()
  const { toggle: toggleMobile } = useSidebarLeft()

  const handleToggle = () => {
    if (isMobile) {
      toggleMobile()
    } else {
      toggleSidebar()
    }
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleToggle} className="flex">
      <IconLayoutSidebar />
      <span className="sr-only">Toggle Sidebar Kiri</span>
    </Button>
  )
}
