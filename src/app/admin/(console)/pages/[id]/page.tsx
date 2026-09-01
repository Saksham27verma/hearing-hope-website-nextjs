import { notFound } from "next/navigation";
import { PageForm } from "@/components/admin/PageForm";
import { getAdminHomeBundle, getAdminPage } from "@/lib/admin-site-cms";
import { SITE_PAGE_IDS } from "@/lib/site-cms/pages";
import type { SitePageId } from "@/lib/site-cms/types";

export default async function AdminPageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!SITE_PAGE_IDS.includes(id as SitePageId)) notFound();
  const pageId = id as SitePageId;
  if (pageId === "home") {
    const { page, slides, photos } = await getAdminHomeBundle();
    return <PageForm page={page} slides={slides} photos={photos} />;
  }
  const page = await getAdminPage(pageId);
  return <PageForm page={page} />;
}
