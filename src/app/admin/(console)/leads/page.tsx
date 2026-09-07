import { LeadsInbox } from "@/components/admin/LeadsInbox";
import { listAdminLeads } from "@/lib/admin-leads";

export default async function AdminLeadsPage() {
  const { items, missingTable } = await listAdminLeads();
  return <LeadsInbox items={items} missingTable={missingTable} />;
}
