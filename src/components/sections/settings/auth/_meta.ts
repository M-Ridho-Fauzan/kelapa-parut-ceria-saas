import { IconLock } from "@tabler/icons-react"
import type { SettingsMetaSection } from "../_types"

const authMeta: SettingsMetaSection = {
  title: "Autentikasi",
  icon: IconLock,
  items: {
    "profile-form": "Profil",
    "security-form": "Keamanan",
    "auth-options-form": "Opsi Auth",
  },
}

export default authMeta
