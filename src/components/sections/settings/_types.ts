import type { IconProps } from "@tabler/icons-react"
import type { ComponentType } from "react"

export interface SettingsMetaItem {
  title: string
  icon: ComponentType<IconProps>
}

export interface SettingsMetaSection {
  title: string
  icon: ComponentType<IconProps>
  items: Record<string, string>
}

export type SettingsMeta = Record<string, SettingsMetaSection>
