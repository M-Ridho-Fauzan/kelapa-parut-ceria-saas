"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  EventType,
  EVENT_TYPE_CONFIG,
  ALL_EVENT_TYPES,
} from "./types"

interface EventFiltersProps {
  activeFilters: EventType[]
  onFilterChange: (filters: EventType[]) => void
  className?: string
}

export function EventFilters({
  activeFilters,
  onFilterChange,
  className,
}: EventFiltersProps) {
  const handleToggle = (type: EventType) => {
    if (activeFilters.includes(type)) {
      onFilterChange(activeFilters.filter((f) => f !== type))
    } else {
      onFilterChange([...activeFilters, type])
    }
  }

  const handleSelectAll = () => {
    if (activeFilters.length === ALL_EVENT_TYPES.length) {
      onFilterChange([])
    } else {
      onFilterChange([...ALL_EVENT_TYPES])
    }
  }

  const allSelected = activeFilters.length === ALL_EVENT_TYPES.length

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-muted-foreground">
          Filter
        </span>
        <button
          onClick={handleSelectAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {allSelected ? "Batal" : "Semua"}
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {ALL_EVENT_TYPES.map((type) => {
          const config = EVENT_TYPE_CONFIG[type]
          const isActive = activeFilters.includes(type)
          return (
            <button
              key={type}
              onClick={() => handleToggle(type)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <div className={cn("size-2 rounded-full", config.dotColor)} />
              <span>{config.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
