import { SettingsForm } from "@/components/admin/SettingsForm";
import { getAdminSettings } from "@/lib/admin-site-cms";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  return <SettingsForm initial={settings} />;
}
