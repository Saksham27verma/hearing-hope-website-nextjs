import { ProductForm } from "@/app/admin/(console)/products/product-form";
import { listAdminBrands } from "@/lib/admin-catalog";

export default async function NewProductPage() {
  const brands = await listAdminBrands();
  return <ProductForm brands={brands} />;
}
