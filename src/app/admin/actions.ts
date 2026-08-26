"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { invalidateCatalog } from "@/lib/catalog";
import { parseCsv } from "@/lib/csv";
import { slugify } from "@/lib/urls";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { HearingAidFeatureId, HearingAidStyle } from "@/types";

const STYLES: HearingAidStyle[] = ["RIC", "BTE", "ITC", "CIC", "IIC", "ITE"];
const FEATURES: HearingAidFeatureId[] = [
  "rechargeable",
  "bluetooth",
  "noise-cancellation",
  "invisible",
  "custom-fit",
  "power",
];

export type ProductImageInput = { url: string; alt: string };
export type ProductColorInput = {
  name: string;
  hex: string | null;
  isDefault: boolean;
  inStock: boolean;
  images: ProductImageInput[];
};
export type ProductInput = {
  id?: string;
  name: string;
  slug: string;
  brandId: string;
  style: HearingAidStyle;
  badge: string;
  tagline: string;
  overview: string;
  mrp: number;
  inStock: boolean;
  published: boolean;
  rating: number;
  reviewCount: number;
  featureIds: HearingAidFeatureId[];
  highlights: { title: string; body: string }[];
  images: ProductImageInput[];
  colors: ProductColorInput[];
};

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

export async function logoutAdmin() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const slug = slugify(input.slug || input.name);
    if (!input.name.trim()) return { ok: false, error: "Name is required." };
    if (!input.brandId) return { ok: false, error: "Choose a brand." };
    if (!STYLES.includes(input.style)) return { ok: false, error: "Choose a hearing-aid type." };
    if (!Number.isFinite(input.mrp) || input.mrp < 0) return { ok: false, error: "Enter a valid MRP." };

    const colors = input.colors
      .filter((color) => color.name.trim())
      .map((color, index, list) => ({
        ...color,
        name: color.name.trim(),
        hex: color.hex?.trim() || null,
        isDefault: list.some((item) => item.isDefault) ? color.isDefault : index === 0,
      }));
    const normalized = { ...input, colors };

    const payload = {
      slug,
      brand_id: input.brandId,
      style: input.style,
      name: input.name.trim(),
      badge: input.badge.trim(),
      tagline: input.tagline.trim(),
      overview: input.overview.trim(),
      mrp: input.mrp,
      in_stock: input.inStock,
      published: input.published,
      rating: input.rating || 0,
      review_count: input.reviewCount || 0,
    };

    let productId = input.id;
    if (productId) {
      const { error } = await supabase.from("products").update(payload).eq("id", productId);
      if (error) return { ok: false, error: error.message };
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error || !data) return { ok: false, error: error?.message ?? "Could not create the model." };
      productId = data.id;
    }

    if (!productId) return { ok: false, error: "Missing product id." };

    await replaceChildren(supabase, productId, normalized);
    invalidateCatalog();
    return { ok: true, id: productId };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    invalidateCatalog();
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Delete failed." };
  }
}

export async function deleteAllProducts(): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { data: products, error: selectError } = await supabase.from("products").select("id");
    if (selectError) return { ok: false, error: selectError.message };
    const count = products?.length ?? 0;
    if (count === 0) return { ok: true, count: 0 };
    const { error } = await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return { ok: false, error: error.message };
    invalidateCatalog();
    return { ok: true, count };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Delete failed." };
  }
}

export async function saveBrand(input: {
  id?: string;
  name: string;
  slug: string;
  logoUrl: string;
  sortOrder: number;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const name = input.name.trim();
    const slug = slugify(input.slug || name);
    if (!name) return { ok: false, error: "Brand name is required." };
    const payload = {
      name,
      slug,
      logo_url: input.logoUrl.trim() || `/images/brands/${slug}.svg`,
      sort_order: input.sortOrder || 0,
    };
    if (input.id) {
      const { error } = await supabase.from("brands").update(payload).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      invalidateCatalog();
      return { ok: true, id: input.id };
    }
    const { data, error } = await supabase.from("brands").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not create brand." };
    invalidateCatalog();
    return { ok: true, id: data.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}

export async function importProductsCsv(csvText: string): Promise<{ ok: true; created: number; updated: number } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();
    const rows = parseCsv(csvText);
    if (!rows.length) return { ok: false, error: "No rows found in the CSV." };

    const { data: brands, error: brandError } = await supabase.from("brands").select("id, name, slug");
    if (brandError) return { ok: false, error: brandError.message };
    const brandMap = new Map(
      (brands ?? []).flatMap((brand) => [
        [brand.name.toLowerCase(), brand.id],
        [brand.slug.toLowerCase(), brand.id],
      ]),
    );

    const { data: existingProducts } = await supabase.from("products").select("id, slug");
    const existingMap = new Map((existingProducts ?? []).map((p) => [p.slug, p.id]));

    let created = 0;
    let updated = 0;
    const importedSlugs: string[] = [];

    for (const row of rows) {
      const name = row.name?.trim();
      const slug = slugify(row.slug || name || "");
      const brandId = brandMap.get((row.brand || "").toLowerCase());
      const style = (row.style || "").toUpperCase() as HearingAidStyle;
      
      if (!name || !slug) continue;
      if (!brandId) continue;
      if (!STYLES.includes(style)) continue;

      const featureIds = (row.features || "")
        .split("|")
        .map((item) => item.trim())
        .filter((item): item is HearingAidFeatureId => FEATURES.includes(item as HearingAidFeatureId));
      const highlights = (row.highlights || "")
        .split("||")
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((chunk) => {
          const [title, ...rest] = chunk.split("::");
          return { title: title.trim(), body: rest.join("::").trim() };
        });
      const colors = (row.colors || "")
        .split("||")
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((chunk, index) => {
          const [colorName, hex, flag] = chunk.split("|").map((part) => part.trim());
          return {
            name: colorName,
            hex: hex || null,
            isDefault: flag === "default" || index === 0,
            inStock: true,
          };
        });
      const images = (row.image_urls || "")
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url, index) => ({ url, alt: `${name} photo ${index + 1}` }));

      const existingId = existingMap.get(slug);
      const payload = {
        slug,
        brand_id: brandId,
        style,
        name: name.trim(),
        badge: (row.badge || "").trim(),
        tagline: (row.tagline || "").trim(),
        overview: (row.overview || "").trim(),
        mrp: Number(row.mrp) || 0,
        in_stock: parseBoolean(row.in_stock, true),
        published: parseBoolean(row.published, true),
        rating: Number(row.rating) || 0,
        review_count: Number(row.review_count) || 0,
      };

      let productId = existingId;
      if (existingId) {
        const { error } = await supabase.from("products").update(payload).eq("id", existingId);
        if (error) continue;
        updated += 1;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error || !data) continue;
        productId = data.id;
        existingMap.set(slug, productId);
        created += 1;
      }

      if (productId) {
        await replaceChildrenBatch(supabase, productId, { featureIds, highlights, images, colors, name });
        importedSlugs.push(slug);
      }
    }

    invalidateCatalog(importedSlugs);
    return { ok: true, created, updated };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Import failed." };
  }
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "y"].includes(value.toLowerCase());
}

async function replaceChildren(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  productId: string,
  input: ProductInput,
) {
  await supabase.from("product_images").delete().eq("product_id", productId);
  await supabase.from("product_features").delete().eq("product_id", productId);
  await supabase.from("product_highlights").delete().eq("product_id", productId);
  await supabase.from("product_colors").delete().eq("product_id", productId);

  if (input.featureIds.length) {
    const { error } = await supabase
      .from("product_features")
      .insert(input.featureIds.map((feature_id) => ({ product_id: productId, feature_id })));
    if (error) throw new Error(error.message);
  }

  if (input.highlights.length) {
    const { error } = await supabase.from("product_highlights").insert(
      input.highlights
        .filter((item) => item.title.trim())
        .map((item, sort_order) => ({
          product_id: productId,
          title: item.title.trim(),
          body: item.body.trim(),
          sort_order,
        })),
    );
    if (error) throw new Error(error.message);
  }

  const colorIds: string[] = [];
  if (input.colors.length) {
    const { data, error } = await supabase
      .from("product_colors")
      .insert(
        input.colors.map((color, sort_order) => ({
          product_id: productId,
          name: color.name.trim(),
          hex: color.hex?.trim() || null,
          is_default: color.isDefault,
          in_stock: color.inStock,
          sort_order,
        })),
      )
      .select("id");
    if (error) throw new Error(error.message);
    colorIds.push(...(data ?? []).map((row) => row.id));
  }

  const imageRows = [
    ...input.images
      .filter((item) => item.url)
      .map((item, sort_order) => ({
        product_id: productId,
        color_id: null as string | null,
        url: item.url,
        alt: item.alt || input.name,
        sort_order,
      })),
    ...input.colors.flatMap((color, colorIndex) =>
      color.images
        .filter((item) => item.url)
        .map((item, sort_order) => ({
          product_id: productId,
          color_id: colorIds[colorIndex] ?? null,
          url: item.url,
          alt: item.alt || `${input.name} ${color.name}`,
          sort_order,
        })),
    ),
  ];

  if (imageRows.length) {
    const { error } = await supabase.from("product_images").insert(imageRows);
    if (error) throw new Error(error.message);
  }
}

async function replaceChildrenBatch(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  productId: string,
  input: {
    featureIds: HearingAidFeatureId[];
    highlights: { title: string; body: string }[];
    images: { url: string; alt: string }[];
    colors: { name: string; hex: string | null; isDefault: boolean; inStock: boolean }[];
    name: string;
  },
) {
  await Promise.all([
    supabase.from("product_images").delete().eq("product_id", productId),
    supabase.from("product_features").delete().eq("product_id", productId),
    supabase.from("product_highlights").delete().eq("product_id", productId),
    supabase.from("product_colors").delete().eq("product_id", productId),
  ]);

  const promises: Promise<unknown>[] = [];

  if (input.featureIds.length) {
    promises.push(
      supabase
        .from("product_features")
        .insert(input.featureIds.map((feature_id) => ({ product_id: productId, feature_id })))
    );
  }

  if (input.highlights.length) {
    promises.push(
      supabase.from("product_highlights").insert(
        input.highlights
          .filter((item) => item.title.trim())
          .map((item, sort_order) => ({
            product_id: productId,
            title: item.title.trim(),
            body: item.body.trim(),
            sort_order,
          })),
      )
    );
  }

  let colorIds: string[] = [];
  if (input.colors.length) {
    const { data } = await supabase
      .from("product_colors")
      .insert(
        input.colors.map((color, sort_order) => ({
          product_id: productId,
          name: color.name.trim(),
          hex: color.hex?.trim() || null,
          is_default: color.isDefault,
          in_stock: color.inStock,
          sort_order,
        })),
      )
      .select("id");
    colorIds = (data ?? []).map((row) => row.id);
  }

  if (input.images.length) {
    promises.push(
      supabase.from("product_images").insert(
        input.images.map((item, sort_order) => ({
          product_id: productId,
          color_id: null,
          url: item.url,
          alt: item.alt || input.name,
          sort_order,
        })),
      )
    );
  }

  await Promise.all(promises);
}
