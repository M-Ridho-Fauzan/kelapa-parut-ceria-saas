"use client"

import * as React from "react"
import type { QuickAccessItem } from "@/types/sidebar"

const STORAGE_KEY = "quick-access-items"
const MAX_ITEMS = 4
const MAX_TOTAL = 8

interface QuickAccessContextType {
  items: QuickAccessItem[]
  addItem: (item: QuickAccessItem) => boolean
  removeItem: (id: string) => void
  isMax: boolean
  count: number
  maxItems: number
}

const QuickAccessContext = React.createContext<QuickAccessContextType>({
  items: [],
  addItem: () => false,
  removeItem: () => {},
  isMax: false,
  count: 0,
  maxItems: MAX_ITEMS,
})

export function useQuickAccess() {
  return React.useContext(QuickAccessContext)
}

function loadFromStorage(): QuickAccessItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function QuickAccessProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [items, setItems] = React.useState<QuickAccessItem[]>(loadFromStorage)

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

  const addItem = React.useCallback(
    (item: QuickAccessItem): boolean => {
      let result = false
      setItems((prev) => {
        if (prev.some((i) => i.id === item.id)) return prev
        if (prev.length >= MAX_TOTAL) return prev
        result = true
        return [...prev, item]
      })
      return result
    },
    [],
  )

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return (
    <QuickAccessContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isMax: items.length >= MAX_ITEMS,
        count: items.length,
        maxItems: MAX_ITEMS,
      }}
    >
      {children}
    </QuickAccessContext.Provider>
  )
}
