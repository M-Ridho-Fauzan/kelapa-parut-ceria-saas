"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconMail, IconCheck } from "@tabler/icons-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <IconMail className="mx-auto size-12 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Verifikasi Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Kami telah mengirim link verifikasi ke email Anda
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          {email && (
            <p className="text-sm font-medium text-foreground">{email}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Klik link di email untuk melanjutkan. Jika tidak melihat email,
            cek folder spam.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <IconCheck data-icon="inline-start" />
            Saya sudah verifikasi
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Kembali ke login
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
