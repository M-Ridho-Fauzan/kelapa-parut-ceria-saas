"use client";

import * as React from "react";

import { NavUser } from "@/components/layout/navbar/nav-user";
import { useSidebarRight } from "@/components/layout/sidebar/sidebar-right-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SidebarRightProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function SidebarRight({ user }: SidebarRightProps) {
  const { open, setOpen } = useSidebarRight();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar Kanan</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center border-b px-4">
            <NavUser user={user} variant="sidebar" />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Informasi pengguna akan ditampilkan di sini.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
