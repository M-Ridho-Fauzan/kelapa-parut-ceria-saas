"use client";

import { useActionState, useEffect } from "react";
import { updateSettings, resetSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { IconRefresh } from "@tabler/icons-react";
import type { Setting } from "@/types";

const DESCRIPTIONS: Record<string, string> = {
  session_expiry_hours: "Berapa jam session user sebelum harus login ulang",
  cookie_secure: "Cookie hanya dikirim melalui koneksi HTTPS",
  cookie_httponly:
    "Cookie tidak bisa diakses oleh JavaScript (lebih aman dari XSS)",
};

export function AuthOptionsForm({ settings }: { settings: Setting[] }) {
  const [state, formAction, isPending] = useActionState(updateSettings, null);
  const [resetState, resetFormAction, isResetting] = useActionState(
    resetSettings,
    null,
  );

  useEffect(() => {
    if (state?.toast) toast.add(state.toast);
  }, [state]);

  useEffect(() => {
    if (resetState?.toast) toast.add(resetState.toast);
  }, [resetState]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FieldGroup>
        {settings.map((setting) => (
          <Field key={setting.id}>
            <FieldLabel htmlFor={setting.key}>{setting.label}</FieldLabel>

            {setting.type === "number" && (
              <Input
                id={setting.key}
                name={setting.key}
                type="number"
                defaultValue={setting.value}
                min={1}
              />
            )}

            {setting.type === "boolean" && (
              <Field orientation="horizontal">
                <Switch
                  id={setting.key}
                  name={setting.key}
                  defaultChecked={setting.value === "true"}
                />
                <FieldDescription>
                  {setting.value === "true" ? "Aktif" : "Nonaktif"}
                </FieldDescription>
              </Field>
            )}

            {setting.type === "string" && (
              <Input
                id={setting.key}
                name={setting.key}
                defaultValue={setting.value}
              />
            )}

            {DESCRIPTIONS[setting.key] && (
              <FieldDescription>{DESCRIPTIONS[setting.key]}</FieldDescription>
            )}
          </Field>
        ))}
      </FieldGroup>

      <div className="flex flex-col md:flex-row gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isResetting}
          onClick={() => resetFormAction()}
        >
          <IconRefresh data-icon="inline-start" />
          {isResetting ? "Meriset..." : "Reset ke Default"}
        </Button>
      </div>
    </form>
  );
}
