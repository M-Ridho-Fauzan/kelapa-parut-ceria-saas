import type { TablerIcon } from "@tabler/icons-react"

export interface NavItem {
  id: string
  title: string
  url: string
  icon: TablerIcon
  isActive?: boolean
  badge?: React.ReactNode
}

export interface NavTreeChild {
  id: string
  title: string
  url: string
  items?: NavTreeGrandchild[]
}

export interface NavTreeGrandchild {
  id: string
  title: string
  url: string
}

export interface NavTreeItem extends NavItem {
  items?: NavTreeChild[]
}

export interface QuickAccessItem {
  id: string
  title: string
  url: string
  iconName: string
}
