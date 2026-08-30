"use client";

import { useActionState, useEffect } from "react";
import { createUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "@/components/ui/toast";

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null);

  useEffect(() => {
    if (state?.toast) {
      toast.add(state.toast);
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        <IconPlus data-icon="inline-start" />
        Tambah User
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah User Baru</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nama</FieldLabel>
              <Input id="name" name="name" required placeholder="Nama lengkap" />
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
          </FieldGroup>

          {state?.error && (
            <FieldDescription className="text-destructive">
              {state.error}
            </FieldDescription>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Membuat..." : "Buat User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
