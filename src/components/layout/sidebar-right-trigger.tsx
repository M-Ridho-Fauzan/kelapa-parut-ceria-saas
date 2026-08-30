"use client"

import { Button } from "@/components/ui/button"
import { useSidebarRight } from "@/components/layout/sidebar-right-provider"
import { IconLayoutSidebarRight } from "@tabler/icons-react"

export function SidebarRightTrigger() {
  const { toggle } = useSidebarRight()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      className="flex"
    >
      <IconLayoutSidebarRight />
      <span className="sr-only">Toggle Sidebar Kanan</span>
    </Button>
  )
}
