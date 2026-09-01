import { notFound } from "next/navigation";
import { StylePageForm } from "@/components/admin/StylePageForm";
import { getAdminStylePage } from "@/lib/admin-site-cms";

export default async function AdminTypeEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getAdminStylePage(id.toUpperCase());
  if (!page) notFound();
  return <StylePageForm page={page} />;
}
