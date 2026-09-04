import { cache } from "react";
import { revalidatePath, revalidateTag, updateTag, unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { brandLogoSrc } from "@/data/brands";
import { fallbackProducts } from "@/data/products";
import { isPlaceholderProductImage, resolveProductMedia, styleIllustrationSrc } from "@/lib/product-photo";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { CatalogBrand, HearingAidFeatureId, HearingAidStyle, Product, ProductColor } from "@/types";

export const CATALOG_TAG = "catalog";

const PRODUCT_SELECT = `
  id,
  slug,
  name,
  badge,
  tagline,
  overview,
  mrp,
  in_stock,
  published,
  rating,
  review_count,
  style,
  brands ( slug, name, logo_url ),
  product_features ( feature_id ),
  product_highlights ( title, body, sort_order ),
  product_colors ( id, name, hex, is_default, in_stock, sort_order ),
  product_images ( id, url, alt, sort_order, color_id )
`;

type FeatureRow = { feature_id: HearingAidFeatureId };
type HighlightRow = { title: string; body: string; sort_order: number };
type ColorRow = {
  id: string;
  name: string;
  hex: string | null;
  is_default: boolean;
  in_stock: boolean;
  sort_order: number;
};
type ImageRow = {
  id: string;
  url: string;
  alt: string;
  sort_order: number;
  color_id: string | null;
};
type BrandRow = { slug: string; name: string; logo_url: string };

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  badge: string;
  tagline: string;
  overview: string;
  mrp: number | string;
  in_stock: boolean;
  published: boolean;
  rating: number | string;
  review_count: number;
  style: HearingAidStyle;
  brands: BrandRow | BrandRow[] | null;
  product_features: FeatureRow[] | null;
  product_highlights: HighlightRow[] | null;
  product_colors: ColorRow[] | null;
  product_images: ImageRow[] | null;
};

function asBrand(value: BrandRow | BrandRow[] | null): BrandRow {
  if (!value) return { slug: "", name: "", logo_url: "" };
  return Array.isArray(value) ? (value[0] ?? { slug: "", name: "", logo_url: "" }) : value;
}

export function mapProductRow(row: ProductRow): Product {
  const brand = asBrand(row.brands);
  const featureIds = (row.product_features ?? []).map((item) => item.feature_id);
  const highlights = [...(row.product_highlights ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ title: item.title, body: item.body }));
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((item) => !isPlaceholderProductImage(item.url));
  const productImages = images.filter((item) => !item.color_id).map((item) => item.url);
  const colors: ProductColor[] = [...(row.product_colors ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hex,
      isDefault: color.is_default,
      inStock: color.in_stock,
      sortOrder: color.sort_order,
      images: images.filter((item) => item.color_id === color.id).map((item) => item.url),
    }));
  const defaultColor = colors.find((color) => color.isDefault) ?? colors[0];
  const fallbackImage =
    productImages[0] ??
    defaultColor?.images[0] ??
    images[0]?.url ??
    styleIllustrationSrc(row.style);
  const media = resolveProductMedia({
    image: fallbackImage,
    images: productImages,
    styleFallback: styleIllustrationSrc(row.style),
  });

  return {
    id: row.id,
    slug: row.slug,
    brand: brand.name,
    brandSlug: brand.slug,
    brandLogo: brandLogoSrc(brand.slug, brand.logo_url),
    type: row.style,
    name: row.name,
    badge: row.badge,
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count ?? 0,
    feature: row.tagline,
    overview: row.overview,
    features: highlights,
    featureIds,
    mrp: Number(row.mrp) || 0,
    inStock: row.in_stock,
    rechargeable: featureIds.includes("rechargeable"),
    bluetooth: featureIds.includes("bluetooth"),
    image: media.image,
    images: media.images,
    colors,
    published: row.published,
  };
}

async function fetchPublishedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return fallbackProducts;

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("published", true)
    .order("name");

  if (error) {
    console.error("Failed to load catalog", error.message);
    return [];
  }

  return ((data ?? []) as ProductRow[]).map(mapProductRow);
}

const cachedPublishedProducts = unstable_cache(fetchPublishedProducts, ["catalog-published"], {
  tags: [CATALOG_TAG],
  revalidate: 120,
});

export const listPublishedProducts = cache(async () => cachedPublishedProducts());

export async function getProductBySlug(slug: string) {
  const products = await listPublishedProducts();
  return products.find((product) => product.slug === slug);
}

export async function productsByBrand(brand: string) {
  const products = await listPublishedProducts();
  return products.filter((product) => product.brand.toLowerCase() === brand.toLowerCase());
}

export async function productsByType(style: HearingAidStyle) {
  const products = await listPublishedProducts();
  return products.filter((product) => product.type === style);
}

export async function productsByFeature(id: HearingAidFeatureId) {
  const products = await listPublishedProducts();
  return products.filter((product) => product.featureIds.includes(id));
}

export async function listCatalogBrands(): Promise<CatalogBrand[]> {
  if (!isSupabaseConfigured()) {
    const names = [...new Set(fallbackProducts.map((product) => product.brand))];
    return names.map((name, index) => ({
      id: `seed-brand-${name.toLowerCase()}`,
      slug: name.toLowerCase(),
      name,
      logoUrl: brandLogoSrc(name.toLowerCase()),
      sortOrder: index,
    }));
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("brands").select("id, slug, name, logo_url, sort_order").order("sort_order");
  if (error || !data) {
    console.error("Failed to load brands", error?.message);
    return [];
  }
  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    sortOrder: row.sort_order,
  }));
}

export function searchProducts(products: Product[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q) ||
      product.type.toLowerCase().includes(q),
  );
}

export function invalidateCatalog(slugs?: string[]) {
  try {
    updateTag(CATALOG_TAG);
  } catch {
    // updateTag is a Server Action API; revalidateTag still expires the cache.
  }
  revalidateTag(CATALOG_TAG, "max");
  revalidatePath("/", "layout");
  revalidatePath("/hearing-aids", "layout");
  revalidatePath("/pricing");
  revalidatePath("/checkout");
  revalidatePath("/admin", "layout");
  if (slugs?.length) {
    for (const slug of slugs) {
      revalidatePath(`/hearing-aids/${slug}`);
    }
  }
}

export { PRODUCT_SELECT };
