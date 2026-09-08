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
} from "@tabler/icons-react";
import type { NavTreeItem, NavItem } from "@/types/sidebar";
import { PendingRequestBadge } from "@/components/features/pending-request-badge";

export const data = {
  teams: [
    {
      name: "Kelapa Pengiriman",
      logo: <IconCube />,
      plan: "SaaS",
    },
  ],
  navMain: [
    {
      id: "dashboard",
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      id: "kelola-user",
      title: "Kelola User",
      url: "/dashboard/admin/users",
      icon: IconUsers,
      badge: <PendingRequestBadge />,
    },
    {
      id: "kalender",
      title: "Kalender",
      url: "#",
      icon: IconCalendar,
    },
    {
      id: "coba-item",
      title: "Coba Nav Items",
      url: "#",
      icon: IconCalendar,
    },
    {
      id: "template",
      title: "Template",
      url: "#",
      icon: IconCube,
      items: [
        {
          id: "template-email",
          title: "Email",
          url: "#",
          items: [
            { id: "template-email-welcome", title: "Welcome", url: "#" },
            { id: "template-email-promo", title: "Promo", url: "#" },
          ],
        },
        {
          id: "template-sms",
          title: "SMS",
          url: "#",
        },
      ],
    },
  ] satisfies NavTreeItem[],
  reports: [
    {
      id: "lap-penjualan",
      title: "Laporan Penjualan",
      url: "#",
      icon: IconChartBar,
    },
    { id: "lap-stok", title: "Laporan Stok", url: "#", icon: IconPackage },
    {
      id: "lap-pengiriman",
      title: "Laporan Pengiriman",
      url: "#",
      icon: IconTruckDelivery,
    },
    { id: "lap-keuangan", title: "Laporan Keuangan", url: "#", icon: IconCoin },
    {
      id: "lap-pembelian",
      title: "Laporan Pembelian",
      url: "#",
      icon: IconShoppingCart,
    },
    {
      id: "lap-transaksi",
      title: "Laporan Transaksi",
      url: "#",
      icon: IconReceipt,
    },
  ] satisfies NavItem[],
  navSecondary: [
    { title: "Sampah", url: "#", icon: IconTrash },
    { title: "Pengaturan", url: "#", icon: IconSettings },
  ],
};
