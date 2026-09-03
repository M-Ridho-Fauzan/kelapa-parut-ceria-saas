import { IconCreditCard } from "@tabler/icons-react"
import type { SettingsMetaSection } from "../_types"

const billingMeta: SettingsMetaSection = {
  title: "Pembayaran",
  icon: IconCreditCard,
  items: {
    "payment-methods": "Metode Pembayaran",
    invoices: "Invoice",
    subscription: "Langganan",
  },
}

export default billingMeta
