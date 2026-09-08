import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateUserForm } from "./create-user-form";
import { RegistrationRequestsButton } from "./registration-requests-button";
import { UserList } from "./user-list";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex md:items-center space-y-2 flex-col md:flex-row md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola User</h1>
          <p className="text-sm text-muted-foreground">
            Buat dan kelola akun pengguna
          </p>
        </div>
        <div className="flex gap-2 md:flex-row flex-col">
          <RegistrationRequestsButton />
          <CreateUserForm />
        </div>
      </div>

      <UserList initialUsers={users} />
    </div>
  );
}
