import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { loadAdminCms } from "@/lib/admin-site-cms";

export const dynamic = "force-dynamic";

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  await loadAdminCms();
  return <AdminShell email={user.email}>{children}</AdminShell>;
}
