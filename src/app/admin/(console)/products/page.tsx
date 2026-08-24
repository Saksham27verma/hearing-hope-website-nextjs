import { ProductCatalogClient } from "@/components/admin/ProductCatalogClient";
import { listAdminBrands, listAdminProducts } from "@/lib/admin-catalog";

export default async function AdminProductsPage() {
  const [products, brands] = await Promise.all([listAdminProducts(), listAdminBrands()]);
  return <ProductCatalogClient products={products} brands={brands} />;
}
