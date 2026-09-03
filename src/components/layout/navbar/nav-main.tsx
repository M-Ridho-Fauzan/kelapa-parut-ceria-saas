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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useQuickAccess } from "@/components/layout/sidebar/quick-access-provider"
import {
  IconChevronRight,
  IconChevronDown,
  IconPlus,
  IconCopy,
  IconDotsVertical,
} from "@tabler/icons-react"
import type { NavTreeItem, NavTreeChild } from "@/types/sidebar"

const MAX_VISIBLE = 4

function LeafDropdownMenu({
  onAddToQuickAccess,
  url,
}: {
  onAddToQuickAccess: () => void
  url: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="absolute right-1 top-1/2 -translate-y-1/2 outline-none">
        <IconDotsVertical className="size-3 opacity-0 group-hover/menu-sub-item:opacity-100 transition-opacity" />
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
  )
}

function TreeChildItem({
  child,
  onAddToQuickAccess,
}: {
  child: NavTreeChild
  onAddToQuickAccess: (item: { id: string; title: string; url: string }) => void
}) {
  const [open, setOpen] = React.useState(false)
  const hasChildren = child.items && child.items.length > 0
  const childUrl = hasChildren ? child.items![0].url : child.url
  const handleAdd = () =>
    onAddToQuickAccess({ id: child.id, title: child.title, url: childUrl })

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuSubItem className="relative">
        <CollapsibleTrigger className="w-full">
          <SidebarMenuSubButton render={<a href={childUrl} />}>
            <span>{child.title}</span>
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        {!hasChildren && (
          <LeafDropdownMenu onAddToQuickAccess={handleAdd} url={childUrl} />
        )}
        {hasChildren && (
          <SidebarMenuAction>
            <IconChevronRight
              className={`transition-transform ${open ? "rotate-90" : ""}`}
            />
          </SidebarMenuAction>
        )}
      </SidebarMenuSubItem>
      {hasChildren && (
        <CollapsibleContent>
          <SidebarMenuSub className="mx-1.5 px-1.5">
            {child.items!.map((grandchild) => (
              <SidebarMenuSubItem key={grandchild.id} className="relative">
                <SidebarMenuSubButton render={<a href={grandchild.url} />}>
                  <span>{grandchild.title}</span>
                </SidebarMenuSubButton>
                <LeafDropdownMenu
                  onAddToQuickAccess={() =>
                    onAddToQuickAccess({
                      id: grandchild.id,
                      title: grandchild.title,
                      url: grandchild.url,
                    })
                  }
                  url={grandchild.url}
                />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

function TreeItem({
  item,
  onAddToQuickAccess,
}: {
  item: NavTreeItem
  onAddToQuickAccess: (item: { id: string; title: string; url: string }) => void
}) {
  const [open, setOpen] = React.useState(item.isActive ?? false)
  const hasChildren = item.items && item.items.length > 0
  const itemUrl = hasChildren ? item.items![0].url : item.url
  const handleAdd = () =>
    onAddToQuickAccess({ id: item.id, title: item.title, url: itemUrl })

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger className="w-full">
          <SidebarMenuButton
            className="data-[active=true]:bg-transparent"
            tooltip={item.title}
            render={<a href={itemUrl} />}
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {!hasChildren && (
          <LeafDropdownMenu onAddToQuickAccess={handleAdd} url={itemUrl} />
        )}
        {hasChildren && (
          <SidebarMenuAction>
            <IconChevronRight
              className={`transition-transform ${open ? "rotate-90" : ""}`}
            />
            <span className="sr-only">Toggle</span>
          </SidebarMenuAction>
        )}
        {hasChildren && (
          <CollapsibleContent>
            <SidebarMenuSub className="mx-1.5 px-1.5">
              {item.items!.map((child) => (
                <TreeChildItem
                  key={child.id}
                  child={child}
                  onAddToQuickAccess={onAddToQuickAccess}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavMain({ mainItems }: { mainItems: NavTreeItem[] }) {
  const { addItem } = useQuickAccess()
  const [showAll, setShowAll] = React.useState(false)

  const handleAddToQuickAccess = (item: {
    id: string
    title: string
    url: string
  }) => {
    addItem({
      id: item.id,
      title: item.title,
      url: item.url,
      iconName: "IconCube",
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu>
        {showAll ? (
          <>
            {mainItems.map((item) => (
              <TreeItem
                key={item.id}
                item={item}
                onAddToQuickAccess={handleAddToQuickAccess}
              />
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setShowAll(false)}>
                <IconChevronDown className="rotate-180 transition-transform" />
                <span>Sembunyikan</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        ) : (
          <>
            {mainItems.slice(0, MAX_VISIBLE).map((item) => (
              <TreeItem
                key={item.id}
                item={item}
                onAddToQuickAccess={handleAddToQuickAccess}
              />
            ))}
            {mainItems.length > MAX_VISIBLE && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setShowAll(true)}>
                  <IconChevronDown className="transition-transform" />
                  <span>Lainnya ({mainItems.length - MAX_VISIBLE})</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
