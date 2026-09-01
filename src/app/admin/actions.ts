"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { asBlogFaqs, asBlogSections, blogWordCount, computeReadTime, invalidateBlog } from "@/lib/blog";
import { invalidateCatalog } from "@/lib/catalog";
import { parseCsv } from "@/lib/csv";
import { isPlaceholderProductImage } from "@/lib/product-photo";
import { invalidateSiteMedia } from "@/lib/site-media";
import { GALLERY_AREAS, SITE_IMAGES_BUCKET } from "@/lib/site-media-shared";
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

export type BlogSectionInput = {
  id?: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
};

export type BlogPostInput = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published: boolean;
  publishedAt: string;
  image: string;
  imageAlt: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  sections: BlogSectionInput[];
  faqs: { question: string; answer: string }[];
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
  canonicalPath: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
};

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
        images: color.images.filter((item) => item.url && !isPlaceholderProductImage(item.url)),
      }));
    const normalized = {
      ...input,
      colors,
      images: input.images.filter((item) => item.url && !isPlaceholderProductImage(item.url)),
    };

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

export async function removePlaceholderProductImages(): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();
    const ids: string[] = [];
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from("product_images")
        .select("id, url")
        .range(from, from + pageSize - 1);
      if (error) return { ok: false, error: error.message };
      if (!data?.length) break;
      ids.push(...data.filter((row) => isPlaceholderProductImage(row.url)).map((row) => row.id));
      if (data.length < pageSize) break;
    }
    if (!ids.length) return { ok: true, count: 0 };

    for (let index = 0; index < ids.length; index += 200) {
      const chunk = ids.slice(index, index + 200);
      const { error: deleteError } = await supabase.from("product_images").delete().in("id", chunk);
      if (deleteError) return { ok: false, error: deleteError.message };
    }

    invalidateCatalog();
    return { ok: true, count: ids.length };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not clear leftover photos." };
  }
}

export async function attachProductPhotos(input: {
  assignments: { productId: string; images: ProductImageInput[] }[];
  mode: "replace" | "append";
}): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.assignments.length) return { ok: false, error: "Select at least one hearing aid." };

    let count = 0;
    for (const assignment of input.assignments) {
      const photos = assignment.images.filter((item) => item.url);
      if (!photos.length) continue;

      if (input.mode === "replace") {
        const { error } = await supabase
          .from("product_images")
          .delete()
          .eq("product_id", assignment.productId)
          .is("color_id", null);
        if (error) return { ok: false, error: error.message };
      }

      const { data: existing, error: readError } = await supabase
        .from("product_images")
        .select("sort_order")
        .eq("product_id", assignment.productId)
        .is("color_id", null);
      if (readError) return { ok: false, error: readError.message };

      const start = (existing ?? []).reduce((max, row) => Math.max(max, row.sort_order + 1), 0);
      const { error: insertError } = await supabase.from("product_images").insert(
        photos.map((item, index) => ({
          product_id: assignment.productId,
          color_id: null,
          url: item.url,
          alt: item.alt,
          sort_order: start + index,
        })),
      );
      if (insertError) return { ok: false, error: insertError.message };
      count += 1;
    }

    invalidateCatalog();
    return { ok: true, count };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save photos." };
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
      const { invalidateSiteCms } = await import("@/lib/site-cms");
      invalidateSiteCms();
      return { ok: true, id: input.id };
    }
    const { data, error } = await supabase.from("brands").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not create brand." };
    invalidateCatalog();
    const { invalidateSiteCms } = await import("@/lib/site-cms");
    invalidateSiteCms();
    return { ok: true, id: data.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}

export async function importProductsCsv(csvText: string): Promise<{ ok: true; created: number; updated: number; skipped: number; errors: string[] } | { ok: false; error: string }> {
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
    let skipped = 0;
    const importedSlugs: string[] = [];
    const errors: string[] = [];

    for (const row of rows) {
      const baseName = row.name?.trim();
      const brandId = brandMap.get((row.brand || "").toLowerCase());
      
      if (!baseName) {
        skipped += 1;
        errors.push(`Row skipped: missing name`);
        continue;
      }
      if (!brandId) {
        skipped += 1;
        errors.push(`"${baseName}": unknown brand "${row.brand}"`);
        continue;
      }

      const styleRaw = (row.style || "").toUpperCase();
      const styleParts = styleRaw
        .split("/")
        .map((s) => s.trim())
        .filter((s): s is HearingAidStyle => STYLES.includes(s as HearingAidStyle));

      if (styleParts.length === 0) {
        skipped += 1;
        errors.push(`"${baseName}": no valid style in "${row.style}" (must be RIC, BTE, ITC, CIC, IIC, or ITE)`);
        continue;
      }

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
        .map((url, index) => ({ url, alt: `${baseName} photo ${index + 1}` }));

      const isMultiStyle = styleParts.length > 1;

      for (const style of styleParts) {
        const name = isMultiStyle ? `${baseName} ${style}` : baseName;
        const baseSlug = row.slug || baseName || "";
        const slug = slugify(isMultiStyle ? `${baseSlug}-${style.toLowerCase()}` : baseSlug);

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
    }

    invalidateCatalog(importedSlugs);
    return { ok: true, created, updated, skipped, errors: errors.slice(0, 10) };
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

  if (input.featureIds.length) {
    await supabase
      .from("product_features")
      .insert(input.featureIds.map((feature_id) => ({ product_id: productId, feature_id })));
  }

  if (input.highlights.length) {
    await supabase.from("product_highlights").insert(
      input.highlights
        .filter((item) => item.title.trim())
        .map((item, sort_order) => ({
          product_id: productId,
          title: item.title.trim(),
          body: item.body.trim(),
          sort_order,
        })),
    );
  }

  if (input.colors.length) {
    await supabase
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
      );
  }

  if (input.images.length) {
    await supabase.from("product_images").insert(
      input.images.map((item, sort_order) => ({
        product_id: productId,
        color_id: null,
        url: item.url,
        alt: item.alt || input.name,
        sort_order,
      })),
    );
  }
}

function normalizeKeywords(values: string[]) {
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const value of values) {
    const keyword = value.trim();
    const key = keyword.toLowerCase();
    if (!keyword || seen.has(key)) continue;
    seen.add(key);
    keywords.push(keyword);
  }
  return keywords;
}

export async function saveBlogPost(input: BlogPostInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const title = input.title.trim();
    const slug = slugify(input.slug || title);
    if (!title) return { ok: false, error: "Title is required." };
    if (!slug) return { ok: false, error: "Add a URL slug." };

    const sections = asBlogSections(
      input.sections.map((section, index) => ({
        ...section,
        id: section.id?.trim() || `${slugify(section.heading) || "section"}-${index + 1}`,
      })),
    );
    const faqs = asBlogFaqs(input.faqs);
    if (input.published && sections.length === 0) {
      return { ok: false, error: "Add at least one section before publishing." };
    }

    const { data: clash, error: clashError } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (clashError) return { ok: false, error: clashError.message };
    if (clash && clash.id !== input.id) return { ok: false, error: "That URL is already used by another article." };

    let previousSlug: string | null = null;
    if (input.id) {
      const { data: existing, error: existingError } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("id", input.id)
        .maybeSingle();
      if (existingError) return { ok: false, error: existingError.message };
      previousSlug = existing?.slug ?? null;
    }

    const publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(input.publishedAt.trim())
      ? input.publishedAt.trim()
      : new Date().toISOString().slice(0, 10);
    const readTime = computeReadTime(blogWordCount({ sections, faqs, excerpt: input.excerpt }));

    const payload = {
      slug,
      title,
      excerpt: input.excerpt.trim(),
      category: input.category.trim() || "Guides",
      published: input.published,
      published_at: publishedAt,
      read_time: readTime,
      image: input.image.trim(),
      image_alt: input.imageAlt.trim() || title,
      author_name: input.authorName.trim(),
      author_role: input.authorRole.trim(),
      author_image: input.authorImage.trim(),
      sections,
      faqs,
      meta_title: input.metaTitle.trim(),
      meta_description: input.metaDescription.trim(),
      focus_keyword: input.focusKeyword.trim(),
      keywords: normalizeKeywords(input.keywords),
      canonical_path: input.canonicalPath.trim(),
      robots_index: input.robotsIndex,
      robots_follow: input.robotsFollow,
      og_title: input.ogTitle.trim(),
      og_description: input.ogDescription.trim(),
      og_image: input.ogImage.trim(),
    };

    let postId = input.id;
    if (postId) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", postId);
      if (error) return { ok: false, error: error.message };
    } else {
      const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single();
      if (error || !data) return { ok: false, error: error?.message ?? "Could not create the article." };
      postId = data.id;
    }

    if (!postId) return { ok: false, error: "Missing article id." };

    if (previousSlug && previousSlug !== slug) {
      await supabase.from("blog_redirects").delete().eq("from_slug", slug);
      const { error: redirectError } = await supabase
        .from("blog_redirects")
        .upsert({ from_slug: previousSlug, to_slug: slug });
      if (redirectError) return { ok: false, error: redirectError.message };
      await supabase.from("blog_redirects").update({ to_slug: slug }).eq("to_slug", previousSlug);
    }

    invalidateBlog([slug, previousSlug].filter((value): value is string => Boolean(value)));
    return { ok: true, id: postId };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error: readError } = await supabase.from("blog_posts").select("slug").eq("id", id).maybeSingle();
    if (readError) return { ok: false, error: readError.message };
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    if (data?.slug) {
      await supabase.from("blog_redirects").delete().eq("from_slug", data.slug);
      await supabase.from("blog_redirects").delete().eq("to_slug", data.slug);
    }
    invalidateBlog(data?.slug ? [data.slug] : undefined);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Delete failed." };
  }
}

export type SiteImageInput = { url: string; alt: string; storagePath?: string };

async function removeStoredFiles(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], paths: string[]) {
  const clean = paths.map((path) => path.trim()).filter(Boolean);
  if (!clean.length) return;
  await supabase.storage.from(SITE_IMAGES_BUCKET).remove(clean);
}

export async function saveGalleryPhoto(input: {
  area: string;
  url: string;
  alt: string;
  storagePath: string;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const area = GALLERY_AREAS.find((item) => item === input.area);
    if (!area) return { ok: false, error: "Unknown gallery slot." };
    if (!input.url.trim()) return { ok: false, error: "Upload a photo first." };

    const { data: existing } = await supabase
      .from("site_media")
      .select("id, storage_path")
      .eq("kind", "gallery")
      .eq("slot", area)
      .maybeSingle();

    const payload = {
      kind: "gallery" as const,
      slot: area,
      sort_order: GALLERY_AREAS.indexOf(area),
      url: input.url.trim(),
      alt: input.alt.trim(),
      storage_path: input.storagePath.trim(),
    };

    if (existing?.id) {
      const { error } = await supabase.from("site_media").update(payload).eq("id", existing.id);
      if (error) return { ok: false, error: error.message };
      if (existing.storage_path && existing.storage_path !== payload.storage_path) {
        await removeStoredFiles(supabase, [existing.storage_path]);
      }
      invalidateSiteMedia();
      return { ok: true, id: existing.id };
    }

    const { data, error } = await supabase.from("site_media").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not save the photo." };
    invalidateSiteMedia();
    return { ok: true, id: data.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}

export async function saveGalleryAlt(area: string, alt: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const slot = GALLERY_AREAS.find((item) => item === area);
    if (!slot) return { ok: false, error: "Unknown gallery slot." };
    const { data, error } = await supabase
      .from("site_media")
      .update({ alt: alt.trim() })
      .eq("kind", "gallery")
      .eq("slot", slot)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: "Add a photo before editing the description." };
    invalidateSiteMedia();
    return { ok: true, id: data.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}

export async function clearGalleryPhoto(area: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const slot = GALLERY_AREAS.find((item) => item === area);
    if (!slot) return { ok: false, error: "Unknown gallery slot." };
    const { data, error: readError } = await supabase
      .from("site_media")
      .select("id, storage_path")
      .eq("kind", "gallery")
      .eq("slot", slot)
      .maybeSingle();
    if (readError) return { ok: false, error: readError.message };
    if (!data) return { ok: true, id: slot };
    const { error } = await supabase.from("site_media").delete().eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    if (data.storage_path) await removeStoredFiles(supabase, [data.storage_path]);
    invalidateSiteMedia();
    return { ok: true, id: data.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Remove failed." };
  }
}

export async function saveClinicPhotos(slug: string, images: SiteImageInput[]): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const clinicSlug = slugify(slug);
    if (!clinicSlug) return { ok: false, error: "Unknown clinic." };

    const { data: existing, error: readError } = await supabase
      .from("site_media")
      .select("id, storage_path")
      .eq("kind", "clinic")
      .eq("slot", clinicSlug);
    if (readError) return { ok: false, error: readError.message };

    const keepPaths = new Set(images.map((image) => image.storagePath).filter(Boolean));
    const stale = (existing ?? [])
      .map((row) => row.storage_path)
      .filter((path) => path && !keepPaths.has(path));

    const { error: deleteError } = await supabase.from("site_media").delete().eq("kind", "clinic").eq("slot", clinicSlug);
    if (deleteError) return { ok: false, error: deleteError.message };

    const rows = images
      .filter((image) => image.url.trim())
      .map((image, index) => ({
        kind: "clinic" as const,
        slot: clinicSlug,
        sort_order: index,
        url: image.url.trim(),
        alt: image.alt.trim(),
        storage_path: image.storagePath?.trim() ?? "",
      }));

    if (rows.length) {
      const { error } = await supabase.from("site_media").insert(rows);
      if (error) return { ok: false, error: error.message };
    }

    await removeStoredFiles(supabase, stale);
    invalidateSiteMedia();
    return { ok: true, id: clinicSlug };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}
