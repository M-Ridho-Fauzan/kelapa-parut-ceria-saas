import { IconBell } from "@tabler/icons-react"

export function NotificationsContent() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconBell className="size-4" />
        <span>Notifikasi</span>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Daftar notifikasi akan ditampilkan di sini.
        </p>
      </div>
    </div>
  )
}
