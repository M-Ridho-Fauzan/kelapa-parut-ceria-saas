"use client";

import { Button } from "@/components/ui/button";
import { useSidebarRight } from "@/components/layout/sidebar/sidebar-right-provider";
import {
  IconLayoutSidebarRight,
  IconLayoutSidebarRightFilled,
} from "@tabler/icons-react";

export function SidebarRightTrigger() {
  const { open, toggle, isMobile } = useSidebarRight();

  if (!isMobile) {
    return (
      <Button variant="ghost" size="icon-sm" onClick={toggle} className="flex">
        {open ? <IconLayoutSidebarRightFilled /> : <IconLayoutSidebarRight />}
        <span className="sr-only">Toggle Sidebar Kanan</span>
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={toggle} className="flex">
      <IconLayoutSidebarRight />
      <span className="sr-only">Toggle Sidebar Kanan</span>
    </Button>
  );
}
