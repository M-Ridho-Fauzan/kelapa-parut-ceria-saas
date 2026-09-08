/**
 * SETTINGS SECTIONS REGISTRY
 *
 * File ini adalah satu-satunya tempat untuk register sections baru.
 * Untuk menambah section baru:
 * 1. Buat folder: components/sections/settings/[nama]/
 * 2. Buat _meta.ts dengan config
 * 3. Buat form files (*.tsx)
 * 4. Tambah 2 baris di bawah ini (import + export)
 */

import type { SettingsMetaSection } from "./_types"

// Import section configs
import authMeta from "./auth/_meta"
import billingMeta from "./billing/_meta"

// Import form components
import { ProfileForm } from "./auth/profile-form"
import { SecurityForm } from "./auth/security-form"
import { AuthOptionsForm } from "./auth/auth-options-form"
import { PaymentMethodsForm } from "./billing/payment-methods-form"
import { InvoicesForm } from "./billing/invoices-form"
import { SubscriptionForm } from "./billing/subscription-form"

// Register sections
export const allSections: Record<string, SettingsMetaSection> = {
  auth: authMeta,
  billing: billingMeta,
}

// Form component props — each form component accepts { user, settings }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const allFormComponents: Record<string, React.ComponentType<any>> = {
  "profile-form": ProfileForm,
  "security-form": SecurityForm,
  "auth-options-form": AuthOptionsForm,
  "payment-methods": PaymentMethodsForm,
  "invoices": InvoicesForm,
  "subscription": SubscriptionForm,
}

export type { SettingsMetaSection } from "./_types"
