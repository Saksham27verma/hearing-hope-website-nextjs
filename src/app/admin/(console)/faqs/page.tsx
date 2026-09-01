import { FaqsManager } from "@/components/admin/FaqsManager";
import { listAdminFaqs } from "@/lib/admin-site-cms";

export default async function AdminFaqsPage() {
  const items = await listAdminFaqs();
  return <FaqsManager items={items} />;
}
