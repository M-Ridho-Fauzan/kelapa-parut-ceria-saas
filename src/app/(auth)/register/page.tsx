"use client";

import { useActionState, useEffect } from "react";
import { submitRegistrationRequest } from "@/app/actions/registration";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    submitRegistrationRequest,
    null,
  );

  useEffect(() => {
    if (state?.toast) {
      toast.add(state.toast);
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Daftar</h1>
          <p className="text-sm text-muted-foreground">
            Kirim permintaan pendaftaran akun
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nama</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="Nama lengkap (opsional)"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm_password">
                Konfirmasi Password
              </FieldLabel>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
              />
            </Field>

            {state?.error && (
              <FieldDescription className="text-destructive">
                {state.error}
              </FieldDescription>
            )}
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Mengirim..." : "Kirim Permintaan"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
