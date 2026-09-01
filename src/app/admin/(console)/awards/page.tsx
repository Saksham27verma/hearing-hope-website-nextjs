import { AwardsManager } from "@/components/admin/AwardsManager";
import { listAdminAwards, listAdminHospitals } from "@/lib/admin-site-cms";

export default async function AdminAwardsPage() {
  const [awards, hospitals] = await Promise.all([listAdminAwards(), listAdminHospitals()]);
  return <AwardsManager awards={awards} hospitals={hospitals} />;
}
