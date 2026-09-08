"use client";

import * as React from "react";
import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollTotp, verifyTotpSetup } from "@/app/actions/totp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { IconShield, IconCheck } from "@tabler/icons-react";
import Image from "next/image";

interface TotpState {
  step: "loading" | "qr" | "verify" | "done";
  qrCode: string;
  secret: string;
  factorId: string;
  code: string;
}

const initialState: TotpState = {
  step: "loading",
  qrCode: "",
  secret: "",
  factorId: "",
  code: "",
};

export default function TotpSetupPage() {
  const router = useRouter();
  const [state, setState] = React.useState<TotpState>(initialState);
  const [, startTransition] = useTransition();
  const hasHandledVerify = React.useRef(false);

  // Use refs to avoid stale closure in useActionState callback
  const stateRef = React.useRef(state);
  React.useEffect(() => { stateRef.current = state; });

  const [verifyState, verifyAction, isPendingVerify] = useActionState(
    async () => {
      const currentState = stateRef.current;
      if (!currentState.factorId || !currentState.code) {
        return {
          error: "Kode tidak boleh kosong",
          toast: { title: "Error", description: "Masukkan kode 6 digit", type: "error" as const },
        };
      }
      return verifyTotpSetup(currentState.factorId, currentState.code);
    },
    null,
  );

  useEffect(() => {
    startTransition(async () => {
      const result = await enrollTotp();
      if (result.success && result.qrCode) {
        setState({
          step: "qr",
          qrCode: result.qrCode,
          secret: result.secret || "",
          factorId: result.factorId || "",
          code: "",
        });
      } else if (result.error) {
        toast.add(result.toast!);
        setState((prev) => ({ ...prev, step: "loading" }));
      }
    });
  }, []);

  useEffect(() => {
    if (hasHandledVerify.current) return;

    if (verifyState?.success) {
      hasHandledVerify.current = true;
      toast.add(verifyState.toast!);
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    } else if (verifyState?.error) {
      toast.add(verifyState.toast!);
    }
  }, [verifyState, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <IconShield className="mx-auto size-12 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Setup Authenticator
          </h1>
          <p className="text-sm text-muted-foreground">
            {state.step === "loading" && "Memuat QR code..."}
            {state.step === "qr" && "Scan QR code dengan authenticator app Anda"}
            {state.step === "verify" && "Masukkan kode 6 digit dari authenticator"}
            {state.step === "done" && "TOTP berhasil diaktifkan!"}
          </p>
        </div>

        {state.step === "loading" && (
          <div className="flex justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {state.step === "qr" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              {state.qrCode && (
                <Image
                  src={state.qrCode}
                  alt="QR Code TOTP"
                  width={200}
                  height={200}
                  className="rounded-lg border p-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <FieldDescription className="text-center">
                Atau masukkan kode manual:
              </FieldDescription>
              <div className="rounded-lg bg-muted p-2 text-center font-mono text-sm">
                {state.secret}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => setState((prev) => ({ ...prev, step: "verify" }))}
            >
              Lanjut
              <IconCheck data-icon="inline-start" />
            </Button>
          </div>
        )}

        {state.step === "verify" && (
          <form action={verifyAction} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="code">Kode Verifikasi</FieldLabel>
                <FieldDescription>
                  Masukkan kode 6 digit dari authenticator app
                </FieldDescription>
                <Input
                  id="code"
                  value={state.code}
                  onChange={(e) => setState((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              className="w-full"
              disabled={isPendingVerify || state.code.length !== 6}
            >
              {isPendingVerify ? "Memverifikasi..." : "Verifikasi"}
            </Button>
          </form>
        )}

        {state.step === "done" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <IconCheck className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Mengalihkan ke dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
