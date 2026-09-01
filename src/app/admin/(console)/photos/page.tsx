import { SitePhotosManager } from "@/components/admin/SitePhotosManager";
import { listAdminSitePhotos } from "@/lib/admin-site-media";

export default async function AdminPhotosPage() {
  const photos = await listAdminSitePhotos();
  return <SitePhotosManager initial={photos} />;
}
