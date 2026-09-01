import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSettingsByGroup } from "@/lib/settings";
import { SidebarLeft } from "@/components/layout/sidebar/sidebar-left";
import { SidebarRight } from "@/components/layout/sidebar/sidebar-right";
import { SidebarRightProvider } from "@/components/layout/sidebar/sidebar-right-provider";
import { SidebarRightTrigger } from "@/components/layout/sidebar/sidebar-right-trigger";
import { NavUser } from "@/components/layout/navbar/nav-user";
import { SettingsProvider } from "@/components/layout/settings/settings-provider";
import { SettingsDialog } from "@/components/layout/settings/settings-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  const settings = await getSettingsByGroup("auth");

  const userData = {
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url,
    role: dbUser?.role || "USER",
  };

  return (
    <SettingsProvider>
      <SidebarRightProvider>
        <SidebarProvider>
          <SidebarLeft />
          <SidebarInset>
            <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
              <div className="flex flex-1 items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1">
                        Kelapa Pengiriman
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2 pr-2">
                <div className="hidden md:block">
                  <NavUser user={userData} variant="sidebar" />
                </div>
                <SidebarRightTrigger />
                <div className="md:hidden">
                  <NavUser user={userData} variant="header" />
                </div>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
          <SidebarRight user={userData} />
        </SidebarProvider>
        <SettingsDialog settings={settings} user={userData} />
      </SidebarRightProvider>
    </SettingsProvider>
  );
}
