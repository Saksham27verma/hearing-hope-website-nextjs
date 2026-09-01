import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { getAdminService } from "@/lib/admin-site-cms";

export default async function AdminEditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getAdminService(id);
  if (!service) notFound();
  return <ServiceForm service={service} />;
}
