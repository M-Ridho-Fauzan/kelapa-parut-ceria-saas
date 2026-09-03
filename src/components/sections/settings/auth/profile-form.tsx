"use client";

import * as React from "react";
import { useActionState, useEffect, useRef } from "react";
import { updateProfile, updateEmail, uploadAvatar } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";
import { IconCamera, IconCheck, IconMail } from "@tabler/icons-react";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [profileState, profileAction, isPendingProfile] = useActionState(
    updateProfile,
    null,
  );
  const [emailState, emailAction, isPendingEmail] = useActionState(
    updateEmail,
    null,
  );
  const [avatarState, avatarAction, isPendingAvatar] = useActionState(
    uploadAvatar,
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState(user.avatar || "");
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);

  useEffect(() => {
    if (profileState?.toast) toast.add(profileState.toast);
  }, [profileState]);

  useEffect(() => {
    if (emailState?.toast) toast.add(emailState.toast);
  }, [emailState]);

  useEffect(() => {
    if (avatarState?.toast) toast.add(avatarState.toast);
  }, [avatarState]);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email.charAt(0).toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAvatarSubmit = (formData: FormData) => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      formData.append("avatar", file);
      avatarAction(formData);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Avatar</FieldLabel>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="size-16">
              <AvatarImage src={previewUrl} alt={user.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <form action={handleAvatarSubmit} className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPendingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconCamera data-icon="inline-start" />
                  {isPendingAvatar ? "Mengupload..." : "Ubah Foto"}
                </Button>
                {previewUrl !== user.avatar && (
                  <Button type="submit" size="sm" disabled={isPendingAvatar}>
                    <IconCheck data-icon="inline-start" />
                    Simpan
                  </Button>
                )}
              </form>
              <FieldDescription className="text-center sm:text-left">
                Format: JPEG, PNG, WebP. Maks 2MB.
              </FieldDescription>
            </div>
          </div>
        </Field>

        <form action={profileAction}>
          <Field>
            <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={isPendingProfile}>
                {isPendingProfile ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </Field>
        </form>

        <form action={emailAction}>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldDescription>
              Perubahan email memerlukan verifikasi
            </FieldDescription>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email baru"
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={isPendingEmail}>
                <IconMail data-icon="inline-start" />
                {isPendingEmail ? "Mengirim..." : "Verifikasi"}
              </Button>
            </div>
          </Field>
        </form>
      </FieldGroup>
    </div>
  );
}
