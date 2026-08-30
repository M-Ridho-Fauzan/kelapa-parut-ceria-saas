"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyTotpLogin } from "@/app/actions/totp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { IconLock } from "@tabler/icons-react";

export default function TotpVerifyPage() {
  const router = useRouter();
  const [code, setCode] = React.useState("");

  const [state, formAction, isPending] = useActionState(
    async () => {
      if (!code) {
        return {
          error: "Kode tidak boleh kosong",
          toast: { title: "Error", description: "Masukkan kode 6 digit", type: "error" as const },
        };
      }
      return verifyTotpLogin(code);
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.add(state.toast!);
      router.push("/dashboard");
    } else if (state?.error) {
      toast.add(state.toast!);
    }
  }, [state, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <IconLock className="mx-auto size-12 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Verifikasi TOTP
          </h1>
          <p className="text-sm text-muted-foreground">
            Masukkan kode 6 digit dari authenticator app Anda
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="code">Kode Verifikasi</FieldLabel>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                pattern="[0-9]{6}"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <FieldDescription>
                Buka authenticator app dan masukkan kode yang ditampilkan
              </FieldDescription>
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || code.length !== 6}
          >
            {isPending ? "Memverifikasi..." : "Verifikasi"}
          </Button>
        </form>
      </div>
    </div>
  );
}
