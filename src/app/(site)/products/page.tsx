import { redirect } from "next/navigation";
import { brandHref } from "@/data/brands";
import { typeHref } from "@/data/hearing-aids";

type ProductsPageProps = {
  searchParams: Promise<{ brand?: string | string[]; type?: string | string[] }>;
};

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsRedirect({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const brand = first(params.brand);
  const type = first(params.type);
  if (type) redirect(typeHref(type));
  if (brand) redirect(brandHref(brand));
  redirect("/hearing-aids");
}
