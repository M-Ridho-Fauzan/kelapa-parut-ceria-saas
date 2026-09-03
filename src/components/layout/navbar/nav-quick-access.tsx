"use client"

import * as React from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useQuickAccess } from "@/components/layout/sidebar/quick-access-provider"
import {
  IconDashboard,
  IconUsers,
  IconSettings,
  IconCalendar,
  IconCube,
  IconTrash,
  IconChartBar,
  IconPackage,
  IconTruckDelivery,
  IconCoin,
  IconShoppingCart,
  IconReceipt,
  IconChevronDown,
  IconDotsVertical,
  IconX,
} from "@tabler/icons-react"
import type { TablerIcon } from "@tabler/icons-react"

const iconMap: Record<string, TablerIcon> = {
  IconDashboard,
  IconUsers,
  IconSettings,
  IconCalendar,
  IconCube,
  IconTrash,
  IconChartBar,
  IconPackage,
  IconTruckDelivery,
  IconCoin,
  IconShoppingCart,
  IconReceipt,
}

function getIcon(iconName: string): TablerIcon {
  return iconMap[iconName] || IconCube
}

function QuickAccessDropdown({ onRemove }: { onRemove: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="absolute right-1 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded-none outline-none opacity-0 group-hover/menu-item:opacity-100 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <IconDotsVertical className="size-3.5" />
        <span className="sr-only">More</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right">
        <DropdownMenuItem variant="destructive" onClick={onRemove}>
          <IconX />
          <span>Keluarkan dari Quick-Access</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function useHasMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function NavQuickAccess() {
  const { items, removeItem, maxItems } = useQuickAccess()
  const [showAll, setShowAll] = React.useState(false)
  const hasMounted = useHasMounted()

  if (!hasMounted || items.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Quick-Access</SidebarGroupLabel>
        <p className="px-3 py-2 text-xs text-muted-foreground">
          Masih kosong
        </p>
      </SidebarGroup>
    )
  }

  const visibleItems = showAll ? items : items.slice(0, maxItems)
  const hiddenItems = items.slice(maxItems)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick-Access</SidebarGroupLabel>
      <SidebarMenu>
        {visibleItems.map((item) => {
          const Icon = getIcon(item.iconName)
          return (
            <SidebarMenuItem key={item.id} className="relative">
              <SidebarMenuButton render={<a href={item.url} />}>
                <Icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
              <QuickAccessDropdown onRemove={() => removeItem(item.id)} />
            </SidebarMenuItem>
          )
        })}

        {hiddenItems.length > 0 && (
          <Collapsible open={showAll} onOpenChange={setShowAll}>
            <SidebarMenuItem>
              <CollapsibleTrigger>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <IconChevronDown
                    className={`transition-transform ${showAll ? "rotate-180" : ""}`}
                  />
                  <span>
                    {showAll ? "Sembunyikan" : `Lainnya (${hiddenItems.length})`}
                  </span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              {hiddenItems.map((item) => {
                const Icon = getIcon(item.iconName)
                return (
                  <SidebarMenuItem key={item.id} className="relative">
                    <SidebarMenuButton render={<a href={item.url} />}>
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    <QuickAccessDropdown onRemove={() => removeItem(item.id)} />
                  </SidebarMenuItem>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
