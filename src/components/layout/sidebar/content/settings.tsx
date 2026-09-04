import { IconSettings } from "@tabler/icons-react"

export function SettingsContent() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <IconSettings className="size-4" />
        <span>Pengaturan</span>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Pengaturan cepat akan ditampilkan di sini.
        </p>
      </div>
    </div>
  )
}
