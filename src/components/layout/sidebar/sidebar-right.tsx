"use client";

import * as React from "react";
import {
  useSidebarRight,
  rightSidebarNavItems,
} from "@/components/layout/sidebar/sidebar-right-provider";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavUser } from "../navbar/nav-user";
import { QuickInfoContent } from "@/components/layout/sidebar/content/quick-info";
import { CalendarContent } from "@/components/layout/sidebar/content/calendar";
import { NotificationsContent } from "@/components/layout/sidebar/content/notifications";
import { SettingsContent } from "@/components/layout/sidebar/content/settings";

interface SidebarRightProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const contentMap: Record<string, React.ComponentType> = {
  "quick-info": QuickInfoContent,
  calendar: CalendarContent,
  notifications: NotificationsContent,
  settings: SettingsContent,
};

function NavIconButton({
  item,
  isActive,
  onClick,
}: {
  item: (typeof rightSidebarNavItems)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        className={cn(
          "flex size-9 items-center justify-center rounded-md transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Icon className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>{item.title}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function SidebarRight({ user }: SidebarRightProps) {
  const {
    open,
    setOpen,
    isMobile,
    activeItem,
    setActiveItem,
    width,
    setWidth,
    isResizing,
    setIsResizing,
    minWidth,
    maxWidth,
    toggle,
  } = useSidebarRight();

  const ActiveContent = contentMap[activeItem.id] || QuickInfoContent;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentPanelRef = React.useRef<HTMLDivElement>(null);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(0);
  const currentWidthRef = React.useRef(width);
  const ICON_WIDTH = 48;
  const RESIZE_HANDLE_WIDTH = 4;

  React.useEffect(() => {
    currentWidthRef.current = width;
  }, [width]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U";

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      currentWidthRef.current = width;
    },
    [width, setIsResizing],
  );

  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startXRef.current - e.clientX;
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidthRef.current + deltaX),
      );
      currentWidthRef.current = newWidth;
      if (containerRef.current) {
        containerRef.current.style.width = `${newWidth}px`;
      }
      if (contentPanelRef.current) {
        const contentW = newWidth - ICON_WIDTH - RESIZE_HANDLE_WIDTH;
        contentPanelRef.current.style.width = `${Math.max(0, contentW)}px`;
      }
    };

    const handleMouseUp = () => {
      setWidth(currentWidthRef.current);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, minWidth, maxWidth, setWidth, setIsResizing]);

  // Mobile: Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar Kanan</SheetTitle>
          </SheetHeader>
          <div className="flex h-full">
            <div className="flex-1 overflow-y-auto">
              <ActiveContent />
            </div>
            <div className="flex w-12 flex-col items-center border-l py-2">
              <TooltipProvider>
                {rightSidebarNavItems.map((item) => (
                  <NavIconButton
                    key={item.id}
                    item={item}
                    isActive={activeItem?.id === item.id}
                    onClick={() => setActiveItem(item)}
                  />
                ))}
              </TooltipProvider>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop
  const contentWidth = open ? width - ICON_WIDTH - RESIZE_HANDLE_WIDTH : 0;

  return (
    <div
      ref={containerRef}
      className="hidden bg-sidebar h-screen border-l md:flex md:flex-row shrink-0"
      style={{ width: `${open ? width : ICON_WIDTH}px` }}
    >
      {/* Resize Handle */}
      {open && (
        <div
          className={cn(
            "shrink-0 w-1 h-full cursor-col-resize flex items-center justify-center group/resize",
            "bg-transparent hover:bg-primary/20 transition-colors",
            isResizing && "bg-primary/20",
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="w-px h-6 rounded-full bg-border group-hover/resize:bg-primary/50 transition-colors" />
        </div>
      )}

      {/* Content Panel - LEFT */}
      <div
        ref={contentPanelRef}
        className="shrink-0 overflow-hidden"
        style={{ width: `${contentWidth}px` }}
      >
        <div className="flex h-full flex-col w-full">
          <div className="border-b">
            {user && <NavUser user={user} variant="sidebar" />}
          </div>
          <div className="flex-1 overflow-y-auto">
            <ActiveContent />
          </div>
        </div>
      </div>

      {/* Icon Navigation - RIGHT (always 48px) */}
      <div className="flex w-12 flex-col items-center border-l py-2 shrink-0">
        <TooltipProvider>
          {user && (
            <Tooltip>
              <TooltipTrigger onClick={toggle} className="mb-2 cursor-pointer">
                <Avatar className="size-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{open ? "Tutup" : "Buka"} sidebar</p>
              </TooltipContent>
            </Tooltip>
          )}

          {rightSidebarNavItems.map((item) => (
            <NavIconButton
              key={item.id}
              item={item}
              isActive={activeItem?.id === item.id}
              onClick={() => {
                if (!open) {
                  toggle();
                }
                setActiveItem(item);
              }}
            />
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
