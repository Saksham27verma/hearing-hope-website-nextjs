import { BrandManager } from "@/app/admin/(console)/brands/brand-manager";
import { listAdminBrands } from "@/lib/admin-catalog";
import { listAdminBrandProfiles } from "@/lib/admin-site-cms";

export default async function AdminBrandsPage() {
  const [brands, profiles] = await Promise.all([listAdminBrands(), listAdminBrandProfiles()]);
  return <BrandManager brands={brands} profiles={profiles} />;
}
