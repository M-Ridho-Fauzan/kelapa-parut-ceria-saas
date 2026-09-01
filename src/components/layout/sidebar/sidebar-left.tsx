"use client";

import * as React from "react";

import { NavMain } from "@/components/layout/navbar/nav-main";
import { NavFavorites } from "@/components/layout/navbar/nav-favorites";
import { NavWorkspaces } from "@/components/layout/navbar/nav-workspaces";
import { NavSecondary } from "@/components/layout/navbar/nav-secondary";
import { TeamSwitcher } from "@/components/features/team-switcher";
import { useSettings } from "@/components/layout/settings/settings-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { data } from "@/types/navigator";

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { setOpen } = useSettings();

  const navSecondaryWithSettings = data.navSecondary.map((item) => {
    if (item.title === "Pengaturan") {
      return { ...item, onClick: () => setOpen(true) };
    }
    return item;
  });

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="border-b">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavFavorites favorites={data.favorites} />
        <NavWorkspaces workspaces={data.workspaces} />
        <NavSecondary items={navSecondaryWithSettings} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
