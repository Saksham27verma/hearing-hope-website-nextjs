import { notFound } from "next/navigation";
import { BrandStoryForm } from "@/components/admin/BrandStoryForm";
import { getAdminBrandProfile } from "@/lib/admin-site-cms";

export default async function AdminBrandStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await getAdminBrandProfile(id);
  if (!brand) notFound();
  return <BrandStoryForm brand={brand} />;
}
