"use client";

import { useActionState, useEffect } from "react";
import { signIn } from "@/app/actions/auth";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null);

  useEffect(() => {
    if (state?.toast) {
      toast.add(state.toast);
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Masuk</h1>
          <p className="text-sm text-muted-foreground">
            Masuk ke akun kamu untuk melanjutkan
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <FieldGroup>
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
                placeholder="••••••••"
              />
              {state?.error && (
                <FieldDescription className="text-destructive">
                  {state.error}
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Masuk..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
