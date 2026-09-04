import { IconDashboard } from "@tabler/icons-react"

export function QuickInfoContent() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconDashboard className="size-4" />
        <span>Info Cepat</span>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Ringkasan informasi akan ditampilkan di sini.
        </p>
      </div>
    </div>
  )
}
