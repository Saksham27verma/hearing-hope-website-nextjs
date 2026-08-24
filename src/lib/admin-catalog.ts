import { requireAdmin } from "@/lib/admin";
import { PRODUCT_SELECT, mapProductRow, type ProductRow } from "@/lib/catalog";
import type { CatalogBrand, Product } from "@/types";

export async function listAdminProducts(): Promise<Product[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ProductRow[]).map(mapProductRow);
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProductRow(data as ProductRow) : null;
}

export async function listAdminBrands(): Promise<CatalogBrand[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("brands")
    .select("id, slug, name, logo_url, sort_order")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    sortOrder: row.sort_order,
  }));
}
