"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CalendarEvent, EventType, EVENT_TYPE_CONFIG } from "./types"
import type { DayButton } from "react-day-picker"

interface EventDayButtonProps extends React.ComponentProps<typeof DayButton> {
  events: CalendarEvent[]
  activeFilters: EventType[]
}

export function EventDayButton({
  events,
  activeFilters,
  day,
  modifiers,
  ...props
}: EventDayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  // Get events for this day that match active filters
  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    const isSameDay =
      eventDate.getDate() === day.date.getDate() &&
      eventDate.getMonth() === day.date.getMonth() &&
      eventDate.getFullYear() === day.date.getFullYear()
    return isSameDay && activeFilters.includes(event.type)
  })

  // Get unique event types for dots (max 4)
  const eventTypes = [...new Set(dayEvents.map((e) => e.type))].slice(0, 4)

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
        modifiers.today && "font-semibold",
        modifiers.selected && "text-primary-foreground",
      )}
      {...props}
    >
      <span>{day.date.getDate()}</span>
      {/* Event dots */}
      {eventTypes.length > 0 && (
        <div className="flex items-center gap-0.5 absolute bottom-0.5">
          {eventTypes.map((type) => (
            <div
              key={type}
              className={cn(
                "size-1 rounded-full",
                EVENT_TYPE_CONFIG[type].dotColor,
                modifiers.selected && "bg-primary-foreground/70",
              )}
            />
          ))}
        </div>
      )}
    </Button>
  )
}
