import {
  IconDashboard,
  IconUsers,
  IconSettings,
  IconCalendar,
  IconCube,
  IconTrash,
} from "@tabler/icons-react";

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
      title: "Dashboard",
      url: "/dashboard",
      icon: <IconDashboard />,
    },
    {
      title: "Kelola User",
      url: "/dashboard/admin/users",
      icon: <IconUsers />,
    },
  ],
  navSecondary: [
    {
      title: "Kalender",
      url: "#",
      icon: <IconCalendar />,
    },
    {
      title: "Template",
      url: "#",
      icon: <IconCube />,
    },
    {
      title: "Sampah",
      url: "#",
      icon: <IconTrash />,
    },
    {
      title: "Pengaturan",
      url: "#",
      icon: <IconSettings />,
    },
  ],
  favorites: [],
  workspaces: [],
};
