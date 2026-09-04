/**
 * Calendar Event Types
 *
 * ⚠️ PENTING: Saat ini masih menggunakan LOCAL STATE untuk demo.
 *
 * UNTUK MENGHUBUNGKAN DENGAN DATABASE:
 * 1. Buat model di prisma/schema.prisma:
 *
 *    model CalendarEvent {
 *      id          String   @id @default(cuid())
 *      title       String
 *      date        DateTime
 *      type        EventType
 *      time        String?
 *      description String?
 *      relatedId   String?  // order_id, invoice_id, dll
 *      userId      String
 *      createdAt   DateTime @default(now())
 *      updatedAt   DateTime @updatedAt
 *
 *      user        User     @relation(fields: [userId], references: [id])
 *    }
 *
 *    enum EventType {
 *      DELIVERY
 *      PAYMENT
 *      DEADLINE
 *      COMPLETED
 *    }
 *
 * 2. Buat server actions di src/app/actions/calendar.ts:
 *    - getEvents(userId, startDate, endDate)
 *    - getEventsByDate(userId, date)
 *    - createEvent(data)
 *    - updateEvent(id, data)
 *    - deleteEvent(id)
 *
 * 3. Update CalendarContent untuk fetch dari database:
 *    - Gunakan useEffect untuk fetch events
 *    - Atau gunakan Server Component dengan async/await
 *
 * 4. Integrasi dengan business logic:
 *    - Saat create order → buat event DELIVERY
 *    - Saat create invoice → buat event PAYMENT
 *    - Saat set deadline → buat event DEADLINE
 *    - Saat order selesai → buat event COMPLETED
 */

export type EventType = "delivery" | "payment" | "deadline" | "completed"

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: EventType
  time?: string
  description?: string
  relatedId?: string
}

export const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; color: string; dotColor: string }
> = {
  delivery: {
    label: "Pengiriman",
    color: "bg-blue-500",
    dotColor: "bg-blue-500",
  },
  payment: {
    label: "Pembayaran",
    color: "bg-yellow-500",
    dotColor: "bg-yellow-500",
  },
  deadline: {
    label: "Tenggat",
    color: "bg-red-500",
    dotColor: "bg-red-500",
  },
  completed: {
    label: "Selesai",
    color: "bg-green-500",
    dotColor: "bg-green-500",
  },
}

export const ALL_EVENT_TYPES: EventType[] = [
  "delivery",
  "payment",
  "deadline",
  "completed",
]
