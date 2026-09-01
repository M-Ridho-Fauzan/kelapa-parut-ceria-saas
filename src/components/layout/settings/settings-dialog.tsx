"use client";

import * as React from "react";
import {
  IconLock,
  IconUser,
  IconShield,
  IconSettings,
} from "@tabler/icons-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AuthOptionsForm } from "@/components/sections/settings/auth-options-form";
import { ProfileForm } from "@/components/sections/settings/profile-form";
import { SecurityForm } from "@/components/sections/settings/security-form";
import { useSettings } from "@/components/layout/settings/settings-provider";
import type { Setting } from "@/types";

const navItems = [{ name: "Autentikasi", icon: IconLock, group: "auth" }];

const tabs = [
  { name: "Profil", icon: IconUser, value: "profile" as const },
  { name: "Keamanan", icon: IconShield, value: "security" as const },
  { name: "Opsi Auth", icon: IconSettings, value: "auth-options" as const },
];

interface SettingsDialogProps {
  settings: Setting[];
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

export function SettingsDialog({ settings, user }: SettingsDialogProps) {
  const { open, setOpen, activeTab, setActiveTab } = useSettings();
  const [activeGroup, setActiveGroup] = React.useState("auth");

  const activeItem = navItems.find((item) => item.group === activeGroup);
  const filteredSettings = settings.filter(
    (setting) => setting.group === activeGroup,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[700px] lg:max-w-[800px] [&>button]:z-10">
        <DialogTitle className="sr-only">Pengaturan</DialogTitle>
        <DialogDescription className="sr-only">
          Sesuaikan pengaturan aplikasi di sini.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarHeader>
              <span className="flex items-center gap-2 px-5 py-2 font-bold">
                <IconSettings />
                Pengaturan
              </span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          isActive={item.group === activeGroup}
                          onClick={() => setActiveGroup(item.group)}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex min-h-screen py-5 my-5 max-h-[77dvh] md:max-h-80dvh flex-1 flex-col overflow-hidden sm:min-h-0 sm:h-[500px]">
            <header className="flex h-12 shrink-0 items-center gap-2 sm:h-14">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink>Pengaturan</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {activeItem?.name || "Pengaturan"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex overflow-x-auto border-b px-2 sm:px-4 mt-5">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:text-sm ${
                      activeTab === tab.value
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="size-4" />
                    {tab.name}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {activeTab === "profile" && <ProfileForm user={user} />}
                {activeTab === "security" && (
                  <SecurityForm userRole={user.role} />
                )}
                {activeTab === "auth-options" && (
                  <AuthOptionsForm settings={filteredSettings} />
                )}
              </div>
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
