"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useQuickAccess } from "@/components/layout/sidebar/quick-access-provider";
import {
  IconChevronDown,
  IconPlus,
  IconCopy,
  IconDotsVertical,
} from "@tabler/icons-react";
import type { NavItem } from "@/types/sidebar";

const MAX_VISIBLE = 4;

function ReportDropdown({
  onAddToQuickAccess,
  url,
}: {
  onAddToQuickAccess: () => void;
  url: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="absolute right-1 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded-none outline-none opacity-0 group-hover/menu-item:opacity-100 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <IconDotsVertical className="size-3.5" />
        <span className="sr-only">More</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right">
        <DropdownMenuItem onClick={onAddToQuickAccess}>
          <IconPlus />
          <span>Add to Quick-Access</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(url)}>
          <IconCopy />
          <span>Copy URL</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavReport({
  reportItems,
  className,
}: {
  reportItems: NavItem[];
  className?: string;
}) {
  const { addItem } = useQuickAccess();
  const [showAll, setShowAll] = React.useState(false);

  const handleAddToQuickAccess = (item: NavItem) => {
    addItem({
      id: item.id,
      title: item.title,
      url: item.url,
      iconName: item.icon.name,
    });
  };

  function renderItem(item: NavItem) {
    return (
      <SidebarMenuItem key={item.id} className="relative">
        <SidebarMenuButton render={<a href={item.url} />}>
          <item.icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
        <ReportDropdown
          onAddToQuickAccess={() => handleAddToQuickAccess(item)}
          url={item.url}
        />
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={className}>Report</SidebarGroupLabel>
      <SidebarMenu>
        {showAll ? (
          <>
            {reportItems.map((item) => renderItem(item))}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setShowAll(false)}>
                <IconChevronDown className="rotate-180 transition-transform" />
                <span>Sembunyikan</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        ) : (
          <>
            {reportItems.slice(0, MAX_VISIBLE).map((item) => renderItem(item))}
            {reportItems.length > MAX_VISIBLE && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setShowAll(true)}>
                  <IconChevronDown className="transition-transform" />
                  <span>Lainnya ({reportItems.length - MAX_VISIBLE})</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
