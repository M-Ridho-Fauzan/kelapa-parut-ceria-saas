"use client"

import * as React from "react"
import { NavSecondary } from "@/components/layout/navbar/nav-secondary"
import { TeamSwitcher } from "@/components/features/team-switcher"
import { useSettings } from "@/components/layout/settings/settings-provider"
import { QuickAccessProvider } from "@/components/layout/sidebar/quick-access-provider"
import { useSidebarLeft } from "@/components/layout/sidebar/sidebar-left-provider"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { data } from "@/types/navigator"
import { NavQuickAccess } from "../navbar/nav-quick-access"
import { NavMain } from "../navbar/nav-main"
import { NavReport } from "../navbar/nav-report"
import { IconChevronRight } from "@tabler/icons-react"
import type { NavTreeItem, NavTreeChild, NavItem } from "@/types/sidebar"

function MobileTreeGrandchild({
  item,
}: {
  item: { id: string; title: string; url: string }
}) {
  return (
    <a
      href={item.url}
      className="flex items-center gap-2 rounded-none pl-6 pr-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <span>{item.title}</span>
    </a>
  )
}

function MobileTreeChild({ child }: { child: NavTreeChild }) {
  const [open, setOpen] = React.useState(false)
  const hasChildren = child.items !== undefined && child.items.length > 0
  const childUrl = hasChildren ? child.items![0].url : child.url

  return (
    <div>
      <div className="flex items-center">
        <a
          href={childUrl}
          className="flex flex-1 items-center gap-2 rounded-none px-3 py-1.5 pl-6 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <span>{child.title}</span>
        </a>
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center px-2 py-1.5"
          >
            <IconChevronRight
              className={`size-3.5 transition-transform ${open ? "rotate-90" : ""}`}
            />
          </button>
        )}
      </div>
      {hasChildren && open && (
        <div className="ml-2">
          {child.items!.map((grandchild) => (
            <MobileTreeGrandchild key={grandchild.id} item={grandchild} />
          ))}
        </div>
      )}
    </div>
  )
}

function MobileTreeItem({ item }: { item: NavTreeItem }) {
  const [open, setOpen] = React.useState(false)
  const hasChildren = item.items !== undefined && item.items.length > 0
  const itemUrl = hasChildren ? item.items![0].url : item.url

  return (
    <div>
      <div className="flex items-center">
        <a
          href={itemUrl}
          className="flex flex-1 items-center gap-2 rounded-none px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <item.icon className="size-4" />
          <span>{item.title}</span>
        </a>
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center px-2 py-2"
          >
            <IconChevronRight
              className={`size-4 transition-transform ${open ? "rotate-90" : ""}`}
            />
          </button>
        )}
      </div>
      {hasChildren && open && (
        <div className="ml-2">
          {item.items!.map((child) => (
            <MobileTreeChild key={child.id} child={child} />
          ))}
        </div>
      )}
    </div>
  )
}

function MobileReportItem({ item }: { item: NavItem }) {
  return (
    <a
      href={item.url}
      className="flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
    >
      <item.icon className="size-4" />
      <span>{item.title}</span>
    </a>
  )
}

function SidebarLeftContent() {
  const { setOpen } = useSettings()

  const navSecondaryWithSettings = data.navSecondary.map((item) => {
    if (item.title === "Pengaturan") {
      return { ...item, onClick: () => setOpen(true), icon: <item.icon /> }
    }
    return { ...item, icon: <item.icon /> }
  })

  return (
    <>
      <SidebarHeader className="border-b">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <QuickAccessProvider>
          <NavQuickAccess />
          <NavMain mainItems={data.navMain} />
          <NavReport reportItems={data.reports} />
        </QuickAccessProvider>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <NavSecondary items={navSecondaryWithSettings} className="mt-auto" />
      </SidebarFooter>
    </>
  )
}

function MobileSidebarContent() {
  const { setOpen } = useSettings()

  const navSecondaryWithSettings = data.navSecondary.map((item) => {
    if (item.title === "Pengaturan") {
      return { ...item, onClick: () => setOpen(true), icon: <item.icon /> }
    }
    return { ...item, icon: <item.icon /> }
  })

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <TeamSwitcher teams={data.teams} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col p-2">
          <QuickAccessProvider>
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
              Quick-Access
            </p>
            <NavQuickAccess />
            <div className="my-2 h-px bg-border" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
              Main
            </p>
            {data.navMain.map((item) => (
              <MobileTreeItem key={item.id} item={item} />
            ))}
            <div className="my-2 h-px bg-border" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
              Report
            </p>
            {data.reports.map((item) => (
              <MobileReportItem key={item.id} item={item} />
            ))}
          </QuickAccessProvider>
        </div>
      </div>
      <div className="border-t">
        <NavSecondary items={navSecondaryWithSettings} className="mt-auto" />
      </div>
    </div>
  )
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { open, setOpen, isMobile } = useSidebarLeft()

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar Kiri</SheetTitle>
          </SheetHeader>
          <MobileSidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarLeftContent />
      <SidebarRail />
    </Sidebar>
  )
}
