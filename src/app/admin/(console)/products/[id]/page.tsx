import { notFound } from "next/navigation";
import { ProductForm } from "@/app/admin/(console)/products/product-form";
import { getAdminProduct, listAdminBrands } from "@/lib/admin-catalog";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditPageProps) {
  const { id } = await params;
  const [product, brands] = await Promise.all([getAdminProduct(id), listAdminBrands()]);
  if (!product) notFound();
  return <ProductForm brands={brands} product={product} />;
}
