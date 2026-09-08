"use client";

import { Button } from "@/components/ui/button";
import { useSidebarLeft } from "@/components/layout/sidebar/sidebar-left-provider";
import { IconLayoutSidebar } from "@tabler/icons-react";

export function SidebarLeftTrigger() {
  const { toggle } = useSidebarLeft();

  return (
    <Button variant="ghost" size="icon-sm" onClick={toggle} className="flex">
      <IconLayoutSidebar />
      <span className="sr-only">Toggle Sidebar Kiri</span>
    </Button>
  );
}
