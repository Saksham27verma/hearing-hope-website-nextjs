import { BrandManager } from "@/app/admin/(console)/brands/brand-manager";
import { listAdminBrands } from "@/lib/admin-catalog";

export default async function AdminBrandsPage() {
  const brands = await listAdminBrands();
  return <BrandManager brands={brands} />;
}
