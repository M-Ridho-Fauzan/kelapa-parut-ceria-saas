"use client";

import * as React from "react";
import { IconSettings, IconMenu2 } from "@tabler/icons-react";

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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSettings } from "@/components/layout/settings/settings-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { allSections, allFormComponents } from "@/components/sections/settings/_registry";
import type { Setting } from "@/types";

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
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const sections = Object.entries(allSections);
  const activeSection = allSections[activeGroup];
  const filteredSettings = settings.filter(
    (setting) => setting.group === activeGroup,
  );

  const handleNavClick = (group: string) => {
    setActiveGroup(group);
    const firstTab = Object.keys(allSections[group].items)[0];
    if (firstTab) {
      setActiveTab(firstTab);
    }
    setMobileNavOpen(false);
  };

  const getTabsForSection = (group: string) => {
    const section = allSections[group];
    if (!section) return [];
    return Object.entries(section.items).map(([key, title]) => ({
      value: key,
      name: title,
    }));
  };

  const currentTabs = getTabsForSection(activeGroup);

  const renderContent = () => {
    const FormComponent = allFormComponents[activeTab];
    if (!FormComponent) return null;

    return <FormComponent user={user} settings={filteredSettings} />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 my-2 py-2 md:max-w-[700px] lg:max-w-[800px] [&>button]:z-10">
        <DialogTitle className="sr-only">Pengaturan</DialogTitle>
        <DialogDescription className="sr-only">
          Sesuaikan pengaturan aplikasi di sini.
        </DialogDescription>

        <div className="flex min-h-[95vh] max-h-[77dvh] h-[400px]">
          {/* Desktop: Left nav panel */}
          {!isMobile && (
            <div className="hidden w-48 shrink-0 border-r md:flex md:flex-col">
              <div className="flex items-center gap-2 px-4 py-3 font-bold border-b">
                <IconSettings className="size-4" />
                <span>Pengaturan</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {sections.map(([key, section]) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleNavClick(key)}
                      className={`flex w-full items-center gap-2 rounded-none px-3 py-2 text-sm font-medium ${
                        key === activeGroup
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span>{section.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <header className="flex h-12 shrink-0 items-center gap-2 border-b">
              <div className="flex items-center gap-2 px-4">
                {/* Mobile: Hamburger menu */}
                {isMobile && (
                  <button
                    onClick={() => setMobileNavOpen(true)}
                    className="flex items-center justify-center size-8"
                  >
                    <IconMenu2 className="size-4" />
                  </button>
                )}
                <Breadcrumb>
                  <BreadcrumbList>
                    {!isMobile && (
                      <>
                        <BreadcrumbItem>
                          <BreadcrumbLink>Pengaturan</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </>
                    )}
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {activeSection?.title || "Pengaturan"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b px-2 sm:px-4 mt-5">
              {currentTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:text-sm ${
                    activeTab === tab.value
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Mobile: Navigation Sheet */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu Pengaturan</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col">
              <div className="flex h-14 shrink-0 items-center border-b px-4">
                <span className="flex items-center gap-2 font-bold">
                  <IconSettings className="size-5" />
                  Pengaturan
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {sections.map(([key, section]) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleNavClick(key)}
                      className={`flex w-full items-center gap-2 rounded-none px-3 py-2 text-sm font-medium ${
                        key === activeGroup
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span>{section.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </DialogContent>
    </Dialog>
  );
}
