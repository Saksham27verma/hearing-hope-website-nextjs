import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";

async function AdminSessionLabel() {
  const { user } = await requireAdmin();
  if (!user.email) return null;
  return <p className="truncate px-3 pb-1 text-[11px] text-white/40">{user.email}</p>;
}

export default function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell
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
