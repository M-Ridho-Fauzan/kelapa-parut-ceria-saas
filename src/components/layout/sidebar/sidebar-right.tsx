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
import { IconLayoutSidebarRightCollapseFilled } from "@tabler/icons-react";

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
  badge,
}: {
  item: (typeof rightSidebarNavItems)[0];
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}) {
  const Icon = item.icon;
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-md transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Icon className="size-4" />
        {badge != null && badge > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
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
    unreadCount,
    setUnreadCount,
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

  // Fetch unread notification count
  React.useEffect(() => {
    import("@/app/actions/notification").then(({ getUnreadCount }) => {
      getUnreadCount().then(setUnreadCount);
    });
  }, [setUnreadCount]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debugWidth, setDebugWidth] = React.useState<number | null>(null);

  const handlePointerDown = React.useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsResizing(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      startXRef.current = clientX;
      startWidthRef.current = width;
      currentWidthRef.current = width;
      setDebugWidth(width);
    },
    [width, setIsResizing],
  );

  React.useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const deltaX = startXRef.current - clientX;
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidthRef.current + deltaX),
      );
      currentWidthRef.current = newWidth;
      setDebugWidth(newWidth);
      if (containerRef.current) {
        containerRef.current.style.width = `${newWidth}px`;
      }
      if (contentPanelRef.current) {
        const contentW = newWidth - ICON_WIDTH - RESIZE_HANDLE_WIDTH;
        contentPanelRef.current.style.width = `${Math.max(0, contentW)}px`;
      }
    };

    const handlePointerUp = () => {
      setWidth(currentWidthRef.current);
      setIsResizing(false);
      // DEBUG: clear after short delay so user can see final value
      setTimeout(() => setDebugWidth(null), 1000);
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

  // Mobile: Sheet — full width on mobile
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          showCloseButton={false}
          side="right"
          className="p-0"
          style={{ width: "100vw", maxWidth: "100vw" }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar Kanan</SheetTitle>
          </SheetHeader>
          <div className="flex h-full">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex-1 overflow-y-auto">
                <ActiveContent />
              </div>
              <div className="border-t mb-1.5">
                {user && <NavUser user={user} variant="sidebar" />}
              </div>
            </div>
            <div className="flex w-12 shrink-0 flex-col items-center border-l py-2 justify-between">
              <TooltipProvider>
                <div>
                  <Tooltip>
                    <TooltipTrigger
                      onClick={toggle}
                      className="
                        flex size-9 items-center justify-center rounded-md transition-colors bg-accent text-accent-foreground mb-2"
                    >
                      <IconLayoutSidebarRightCollapseFilled className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Tutup sidebar</p>
                    </TooltipContent>
                  </Tooltip>

                  {rightSidebarNavItems.map((item) => (
                    <NavIconButton
                      key={item.id}
                      item={item}
                      isActive={activeItem?.id === item.id}
                      onClick={() => setActiveItem(item)}
                    />
                  ))}
                </div>

                {user && (
                  <Tooltip>
                    <TooltipTrigger
                      // onClick={toggle}
                      className="mb-2 cursor-pointer"
                    >
                      <Avatar className="size-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{user.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
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

      {/* Content Panel - LEFT */}
      <div
        ref={contentPanelRef}
        className="shrink-0 overflow-hidden"
        style={{ width: `${contentWidth}px` }}
      >
        <div className="flex h-full flex-col w-full">
          <div className="flex-1 [direction:rtl] overflow-y-auto">
            <div className="[direction:ltr]">
              <ActiveContent />
            </div>
          </div>
          <div className="border-t mb-1.5">
            {user && <NavUser user={user} variant="sidebar" />}
          </div>
        </div>
      </div>

      {/* Icon Navigation - RIGHT (always 48px) */}
      <div className="flex w-12 flex-col items-center justify-between border-l py-2 shrink-0">
        <TooltipProvider>
          <div>
            {rightSidebarNavItems.map((item) => (
              <NavIconButton
                key={item.id}
                item={item}
                isActive={activeItem?.id === item.id}
                badge={item.id === "notifications" ? unreadCount : undefined}
                onClick={() => {
                  if (!open) {
                    toggle();
                  }
                  setActiveItem(item);
                }}
              />
            ))}
          </div>

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
        </TooltipProvider>
      </div>

      {/* DEBUG: Width indicator during resize */}
      {/* {debugWidth !== null && (
        <div className="fixed bottom-4 left-1/2 z-200 -translate-x-1/2 rounded-md bg-black/80 px-3 py-1.5 font-mono text-xs text-white shadow-lg">
          {Math.round(debugWidth)}px ({minWidth}–{maxWidth})
        </div>
      )} */}
    </div>
  );
}
