"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import {
  updatePassword,
  signOutAllDevices,
  deleteAccount,
} from "@/app/actions/profile";
import {
  toggleTotp,
  checkTotpStatus,
  checkEmailVerified,
} from "@/app/actions/totp";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
  IconLogout,
  IconAlertTriangle,
  IconLock,
  IconShield,
  IconMail,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";

interface SecurityFormProps {
  userRole: string;
}

export function SecurityForm({ userRole }: SecurityFormProps) {
  const [passwordState, passwordAction, isPendingPassword] = useActionState(
    updatePassword,
    null,
  );
  const [deleteState, deleteAction, isPendingDelete] = useActionState(
    deleteAccount,
    null,
  );

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("");
  const [totpEnabled, setTotPEnabled] = React.useState(false);
  const [emailVerified, setEmailVerified] = React.useState(false);
  const [isLoadingTotp, setIsLoadingTotp] = React.useState(true);
  const [isTogglingTotp, setIsTogglingTotp] = React.useState(false);

  useEffect(() => {
    if (passwordState?.toast) toast.add(passwordState.toast);
  }, [passwordState]);

  useEffect(() => {
    if (deleteState?.toast) {
      toast.add(deleteState.toast);
    }
  }, [deleteState]);

  React.useEffect(() => {
    const loadStatus = async () => {
      const [totpStatus, emailStatus] = await Promise.all([
        checkTotpStatus(),
        checkEmailVerified(),
      ]);
      setTotPEnabled(totpStatus.totpEnabled);
      setEmailVerified(emailStatus.verified);
      setIsLoadingTotp(false);
    };
    loadStatus();
  }, []);

  const handleSignOutAll = async () => {
    const result = await signOutAllDevices();
    if (result.toast) toast.add(result.toast);
  };

  const handleDeleteAccount = () => {
    deleteAction();
  };

  const handleToggleTotp = async (enable: boolean) => {
    setIsTogglingTotp(true);
    const result = await toggleTotp(enable);
    setIsTogglingTotp(false);
    if (result.toast) {
      toast.add(result.toast);
    }
    if (result.success) {
      setTotPEnabled(enable);
    }
  };

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && (
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <IconShield className="size-5 text-primary" />
            <h3 className="text-sm font-medium">
              Autentikasi Dua Faktor (TOTP)
            </h3>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {isLoadingTotp ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Memuat status...
              </div>
            ) : !emailVerified ? (
              <div className="flex items-center gap-3 rounded-md bg-muted p-3">
                <IconMail className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Email belum diverifikasi
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verifikasi email terlebih dahulu untuk mengaktifkan TOTP
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">TOTP Authentication</p>
                    <p className="text-xs text-muted-foreground">
                      {totpEnabled
                        ? "Aktif - Gunakan authenticator app untuk login"
                        : "Nonaktif"}
                    </p>
                  </div>
                  <Button
                    variant={totpEnabled ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggleTotp(!totpEnabled)}
                    disabled={isTogglingTotp}
                  >
                    {isTogglingTotp ? (
                      "Memproses..."
                    ) : totpEnabled ? (
                      <>
                        <IconX data-icon="inline-start" />
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <IconCheck data-icon="inline-start" />
                        Aktifkan
                      </>
                    )}
                  </Button>
                </div>

                {totpEnabled && (
                  <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                    <IconCheck className="size-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      TOTP sudah aktif. Anda akan dimasukkan kode saat login.
                    </p>
                  </div>
                )}

                {!totpEnabled && (
                  <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                    <IconShield className="size-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Aktifkan TOTP untuk keamanan tambahan.{" "}
                      <Link
                        href="/auth/totp-setup"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Setup sekarang
                      </Link>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <FieldGroup>
        <form action={passwordAction}>
          <Field>
            <FieldLabel htmlFor="password">Ganti Password</FieldLabel>
            <FieldDescription>Minimal 6 karakter</FieldDescription>
            <div className="flex items-center gap-2">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan password baru"
                minLength={6}
              />
              <Button type="submit" size="sm" disabled={isPendingPassword}>
                <IconLock data-icon="inline-start" />
                {isPendingPassword ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </Field>
        </form>
      </FieldGroup>

      <div className="rounded-lg border border-destructive/50 p-4">
        <h3 className="text-sm font-medium text-destructive">Zona Bahaya</h3>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row space-y-2  md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium">Logout dari semua perangkat</p>
              <p className="text-xs text-muted-foreground">
                Ini akan menghapus semua session aktif
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOutAll}>
              <IconLogout data-icon="inline-start" />
              Logout Semua
            </Button>
          </div>

          {!isAdmin && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Hapus Akun</p>
                <p className="text-xs text-muted-foreground">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger>
                  <Button variant="destructive" size="sm">
                    <IconAlertTriangle data-icon="inline-start" />
                    Hapus Akun
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hapus Akun</DialogTitle>
                    <DialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Semua data Anda akan
                      dihapus secara permanen.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <Field>
                      <FieldLabel>
                        Ketik <span className="font-bold">HAPUS</span> untuk
                        konfirmasi
                      </FieldLabel>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Ketik HAPUS"
                      />
                    </Field>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={
                        deleteConfirmation !== "HAPUS" || isPendingDelete
                      }
                      onClick={handleDeleteAccount}
                    >
                      {isPendingDelete ? "Menghapus..." : "Hapus Akun"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
