import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold tracking-tight">
        Selamat datang, {user.user_metadata?.name || user.email}
      </h2>
      <p className="text-muted-foreground">
        Ini adalah halaman dashboard kamu.
      </p>
    </div>
  );
}
