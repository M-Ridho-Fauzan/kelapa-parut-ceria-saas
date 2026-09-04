"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { EventFilters } from "./event-filters";
import { EventList } from "./event-list";
import { EventDayButton } from "./event-day";
import { CalendarEvent, EventType, ALL_EVENT_TYPES } from "./types";
import { IconCalendar } from "@tabler/icons-react";

/**
 * ⚠️ PENTING: Saat ini masih menggunakan LOCAL STATE untuk demo.
 *
 * UNTUK MENGHUBUNGKAN DENGAN DATABASE:
 * 1. Buat model CalendarEvent di prisma/schema.prisma (lihat types.ts)
 * 2. Buat server actions di src/app/actions/calendar.ts
 * 3. Ganti mockEvents dengan fetch dari database:
 *
 *    const [events, setEvents] = React.useState<CalendarEvent[]>([])
 *
 *    React.useEffect(() => {
 *      async function fetchEvents() {
 *        const data = await getEvents(userId, startDate, endDate)
 *        setEvents(data)
 *      }
 *      fetchEvents()
 *    }, [userId, currentMonth])
 *
 * 4. Integrasi dengan business logic:
 *    - Order created → createEvent({ type: 'delivery', ... })
 *    - Invoice created → createEvent({ type: 'payment', ... })
 *    - Deadline set → createEvent({ type: 'deadline', ... })
 *    - Order completed → createEvent({ type: 'completed', ... })
 */

// Mock events for demo
function generateMockEvents(): CalendarEvent[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return [
    // Events for current month
    {
      id: "1",
      title: "Pengiriman #1234",
      date: new Date(year, month, 5),
      type: "delivery",
      time: "09:00",
      description: "Jakarta Selatan",
    },
    {
      id: "2",
      title: "Pembayaran Invoice #567",
      date: new Date(year, month, 5),
      type: "payment",
      time: "14:00",
      description: "Rp 2.500.000",
    },
    {
      id: "3",
      title: "Deadline Proyek",
      date: new Date(year, month, 10),
      type: "deadline",
      time: "23:59",
      description: "Submit laporan bulanan",
    },
    {
      id: "4",
      title: "Pengiriman #1235",
      date: new Date(year, month, 12),
      type: "delivery",
      time: "10:30",
      description: "Bandung",
    },
    {
      id: "5",
      title: "Selesai Pengiriman #1230",
      date: new Date(year, month, 12),
      type: "completed",
      time: "16:00",
      description: "Jakarta Pusat",
    },
    {
      id: "6",
      title: "Pembayaran Invoice #568",
      date: new Date(year, month, 15),
      type: "payment",
      time: "11:00",
      description: "Rp 3.750.000",
    },
    {
      id: "7",
      title: "Pengiriman #1236",
      date: new Date(year, month, 18),
      type: "delivery",
      time: "08:00",
      description: "Surabaya",
    },
    {
      id: "8",
      title: "Deadline Pembayaran",
      date: new Date(year, month, 20),
      type: "deadline",
      time: "17:00",
      description: "Invoice #560",
    },
    {
      id: "9",
      title: "Pengiriman #1237",
      date: new Date(year, month, 22),
      type: "delivery",
      time: "13:00",
      description: "Semarang",
    },
    {
      id: "10",
      title: "Selesai Pengiriman #1232",
      date: new Date(year, month, 22),
      type: "completed",
      time: "15:30",
      description: "Yogyakarta",
    },
    {
      id: "11",
      title: "Pembayaran Invoice #569",
      date: new Date(year, month, 25),
      type: "payment",
      time: "10:00",
      description: "Rp 1.200.000",
    },
    {
      id: "12",
      title: "Pengiriman #1238",
      date: new Date(year, month, 28),
      type: "delivery",
      time: "09:30",
      description: "Malang",
    },
  ];
}

export function CalendarContent() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(),
  );
  const [activeFilters, setActiveFilters] =
    React.useState<EventType[]>(ALL_EVENT_TYPES);
  const [events] = React.useState<CalendarEvent[]>(() => generateMockEvents());

  const handleGoToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex flex-col gap-3 p-2">
      {/* Header with Today button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <IconCalendar className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Kalender</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoToToday}
          className="h-7 text-xs"
        >
          Hari Ini
        </Button>
      </div>

      {/* Event Filters */}
      <EventFilters
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
      />

      <div className="w-full bg-sidebar">
        {/* Calendar */}
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="**:[[role=gridcell]]:w-7.5 mx-auto"
          // className="[&_[role=gridcell]]:w-[30px] mx-auto"
          components={{
            DayButton: (props) => (
              <EventDayButton
                {...props}
                events={events}
                activeFilters={activeFilters}
              />
            ),
          }}
        />
      </div>

      {/* Event List */}
      <EventList events={events} selectedDate={selectedDate} />
    </div>
  );
}
