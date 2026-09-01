import { notFound } from "next/navigation";
import { FeaturePageForm } from "@/components/admin/FeaturePageForm";
import { getAdminFeaturePage } from "@/lib/admin-site-cms";

export default async function AdminFeatureEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getAdminFeaturePage(id);
  if (!page) notFound();
  return <FeaturePageForm page={page} />;
}
