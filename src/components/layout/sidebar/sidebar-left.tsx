"use client";

import * as React from "react";
import { NavSecondary } from "@/components/layout/navbar/nav-secondary";
import { TeamSwitcher } from "@/components/features/team-switcher";
import { useSettings } from "@/components/layout/settings/settings-provider";
import { QuickAccessProvider } from "@/components/layout/sidebar/quick-access-provider";
import { useSidebarLeft } from "@/components/layout/sidebar/sidebar-left-provider";
import { useIsTablet } from "@/hooks/use-tablet";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { data } from "@/types/navigator";
import { NavQuickAccess } from "../navbar/nav-quick-access";
import { NavMain } from "../navbar/nav-main";
import { NavReport } from "../navbar/nav-report";
import { IconChevronRight } from "@tabler/icons-react";
import type { NavTreeItem, NavTreeChild, NavItem } from "@/types/sidebar";

function MobileTreeGrandchild({
  item,
}: {
  item: { id: string; title: string; url: string };
}) {
  return (
    <a
      href={item.url}
      className="flex items-center gap-2 rounded-none pl-6 pr-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <span>{item.title}</span>
    </a>
  );
}

function MobileTreeChild({ child }: { child: NavTreeChild }) {
  const [open, setOpen] = React.useState(false);
  const hasChildren = child.items !== undefined && child.items.length > 0;
  const childUrl = hasChildren ? child.items![0].url : child.url;

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
  );
}

function MobileTreeItem({ item }: { item: NavTreeItem }) {
  const [open, setOpen] = React.useState(false);
  const hasChildren = item.items !== undefined && item.items.length > 0;
  const itemUrl = hasChildren ? item.items![0].url : item.url;

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
  );
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
  );
}

function DesktopSidebarContent() {
  const { setOpen } = useSettings();

  const navSecondaryWithSettings = data.navSecondary.map((item) => {
    if (item.title === "Pengaturan") {
      return { ...item, onClick: () => setOpen(true), icon: <item.icon /> };
    }
    return { ...item, icon: <item.icon /> };
  });

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <TeamSwitcher teams={data.teams} />
      </div>
      <div className="flex-1 overflow-y-auto snap-y">
        <div className="flex flex-col p-2">
          <QuickAccessProvider>
            <NavQuickAccess className="snap-start" />
            <div className="my-2 h-px bg-border" />
            <NavMain className="snap-start" mainItems={data.navMain} />
            <div className="my-2 h-px bg-border" />
            <NavReport className="snap-start" reportItems={data.reports} />
          </QuickAccessProvider>
        </div>
      </div>
      <div className="border-t">
        <NavSecondary items={navSecondaryWithSettings} className="mt-auto" />
      </div>
    </div>
  );
}

function MobileSidebarContent() {
  const { setOpen } = useSettings();

  const navSecondaryWithSettings = data.navSecondary.map((item) => {
    if (item.title === "Pengaturan") {
      return { ...item, onClick: () => setOpen(true), icon: <item.icon /> };
    }
    return { ...item, icon: <item.icon /> };
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <TeamSwitcher teams={data.teams} />
      </div>
      <div className="flex-1 overflow-y-auto snap-y">
        <div className="flex flex-col p-2">
          <QuickAccessProvider>
            <NavQuickAccess />
            <div className="my-2 h-px bg-border" />
            <p className="px-3 py-1 text-xs snap-start font-semibold text-muted-foreground uppercase">
              Main
            </p>
            {data.navMain.map((item) => (
              <MobileTreeItem key={item.id} item={item} />
            ))}
            <div className="my-2 h-px bg-border" />
            <p className="px-3 py-1 text-xs snap-start font-semibold text-muted-foreground uppercase">
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
  );
}

export function SidebarLeft() {
  const {
    open,
    setOpen,
    isMobile,
    width,
    setWidth,
    isResizing,
    setIsResizing,
    minWidth,
    maxWidth,
  } = useSidebarLeft();
  const isTablet = useIsTablet();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(0);
  const currentWidthRef = React.useRef(width);

  React.useEffect(() => {
    currentWidthRef.current = width;
  }, [width]);

  const handlePointerDown = React.useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      startXRef.current = clientX;
      startWidthRef.current = width;
      currentWidthRef.current = width;
    },
    [width, setIsResizing],
  );

  React.useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - startXRef.current;
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidthRef.current + deltaX),
      );
      currentWidthRef.current = newWidth;
      if (containerRef.current) {
        containerRef.current.style.width = `${newWidth}px`;
      }
    };

    const handlePointerUp = () => {
      setWidth(currentWidthRef.current);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("mouseup", handlePointerUp);
    document.addEventListener("touchmove", handlePointerMove, {
      passive: false,
    });
    document.addEventListener("touchend", handlePointerUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("mouseup", handlePointerUp);
      document.removeEventListener("touchmove", handlePointerMove);
      document.removeEventListener("touchend", handlePointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, minWidth, maxWidth, setWidth, setIsResizing]);

  if (isMobile || isTablet) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar Kiri</SheetTitle>
          </SheetHeader>
          <MobileSidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "hidden md:flex h-screen border-r shrink-0 overflow-hidden",
        isResizing && "select-none",
      )}
      style={{
        width: open ? `${width}px` : "0px",
      }}
    >
      {/* Sidebar Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <DesktopSidebarContent />
      </div>

      {/* Resize Handle - at right edge */}
      {open && (
        <div
          className={cn(
            "shrink-0 w-1 h-full cursor-col-resize flex items-center justify-center group/resize touch-none",
            "bg-transparent hover:bg-primary/20 transition-colors",
            isResizing && "bg-primary/20",
          )}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        >
          <div className="w-px h-6 rounded-full bg-border group-hover/resize:bg-primary/50 transition-colors" />
        </div>
      )}
    </div>
  );
}
