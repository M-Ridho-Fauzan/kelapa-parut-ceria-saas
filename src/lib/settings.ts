import { prisma } from "@/lib/prisma";

export async function getSetting(key: string) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function getSettingsByGroup(group: string) {
  return prisma.setting.findMany({
    where: { group },
    orderBy: { key: "asc" },
  });
}

export async function getAllSettings() {
  return prisma.setting.findMany({ orderBy: { key: "asc" } });
}

export async function getAuthSettings() {
  const settings = await prisma.setting.findMany({
    where: { group: "auth" },
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  return {
    sessionExpiryHours: Number(map.session_expiry_hours ?? 24),
    cookieSecure: map.cookie_secure === "true",
    cookieHttpOnly: map.cookie_httponly === "true",
  };
}

export async function seedDefaultSettings() {
  const defaults = [
    {
      key: "session_expiry_hours",
      value: "24",
      group: "auth",
      type: "number",
      label: "Masa berlaku session (jam)",
    },
    {
      key: "cookie_secure",
      value: "true",
      group: "auth",
      type: "boolean",
      label: "Cookie hanya via HTTPS",
    },
    {
      key: "cookie_httponly",
      value: "true",
      group: "auth",
      type: "boolean",
      label: "Cookie tidak bisa diakses JavaScript",
    },
  ];

  for (const setting of defaults) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
}
