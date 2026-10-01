import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { unreadNotificationCount } from "@/lib/notifications/bell";

async function AdminSessionLabel() {
  const { user } = await requireAdmin();
  if (!user.email) return null;
  return <p className="truncate px-3 pb-1 text-[11px] text-white/40">{user.email}</p>;
}

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const { data: member } = await supabase.from("team_members").select("id").eq("auth_user_id", user.id).maybeSingle();
  const unreadCount = member?.id ? await unreadNotificationCount(supabase, String(member.id)).catch(() => 0) : 0;
  return (
    <AdminShell
      unreadCount={unreadCount}
      email={
        <Suspense fallback={null}>
          <AdminSessionLabel />
        </Suspense>
      }
    >
      {children}
    </AdminShell>
  );
}
