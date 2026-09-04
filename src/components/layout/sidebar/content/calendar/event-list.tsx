"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarEvent, EVENT_TYPE_CONFIG } from "./types";
import { IconClock } from "@tabler/icons-react";

interface EventListProps {
  events: CalendarEvent[];
  selectedDate: Date | undefined;
  className?: string;
}

function formatSelectedDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EventList({ events, selectedDate, className }: EventListProps) {
  if (!selectedDate) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-6 text-center",
          className,
        )}
      >
        <IconClock className="size-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          Pilih tanggal untuk melihat acara
        </p>
      </div>
    );
  }

  const filteredEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    })
    .sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return a.time.localeCompare(b.time);
    });

  if (filteredEvents.length === 0) {
    return (
      <div className={cn("flex flex-col py-4", className)}>
        <p className="text-xs text-muted-foreground mb-2">
          {formatSelectedDate(selectedDate)}
        </p>
        <p className="text-sm text-muted-foreground text-center py-4">
          Tidak ada acara
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-xs text-muted-foreground px-1">
        {formatSelectedDate(selectedDate)}
      </p>
      <div className="flex flex-col gap-1">
        {filteredEvents.map((event) => {
          const config = EVENT_TYPE_CONFIG[event.type];
          return (
            <div
              key={event.id}
              className="flex items-start gap-2 rounded-md border p-2 hover:bg-sidebar-accent/50 transition-colors"
            >
              <div
                className={cn(
                  "size-2 rounded-full mt-1.5 shrink-0",
                  config.dotColor,
                )}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {event.title}
                  </span>
                </div>
                {(event.time || event.description) && (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {event.time && (
                      <span className="text-xs text-muted-foreground">
                        {event.time}
                      </span>
                    )}
                    {event.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {event.description}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
