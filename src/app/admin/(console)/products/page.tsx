import { ProductCatalogClient } from "@/components/admin/ProductCatalogClient";
import { listAdminBrands, listAdminProducts } from "@/lib/admin-catalog";
import { removePlaceholderProductImages } from "@/app/admin/actions";

export default async function AdminProductsPage() {
  await removePlaceholderProductImages();
  const [products, brands] = await Promise.all([listAdminProducts(), listAdminBrands()]);
  return <ProductCatalogClient products={products} brands={brands} />;
}
