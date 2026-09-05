"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/features/theme-provider"
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
} from "@tabler/icons-react"

const THEME_CONFIG = {
  light: {
    icon: IconSun,
    label: "Mode Terang",
  },
  dark: {
    icon: IconMoon,
    label: "Mode Gelap",
  },
  system: {
    icon: IconDeviceDesktop,
    label: "Mode Sistem",
  },
} as const

function ThemeToggleInner() {
  const { theme, cycleTheme } = useTheme()
  const config = THEME_CONFIG[theme]
  const Icon = config.icon

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={cycleTheme}
      title={config.label}
      className="flex"
    >
      <Icon />
      <span className="sr-only">{config.label}</span>
    </Button>
  )
}

// Dynamic import with SSR disabled to avoid hydration mismatch
export const ThemeToggle = dynamic(
  () => Promise.resolve(ThemeToggleInner),
  {
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="icon-sm" disabled className="flex">
        <IconDeviceDesktop />
        <span className="sr-only">Mode Sistem</span>
      </Button>
    ),
  },
)
