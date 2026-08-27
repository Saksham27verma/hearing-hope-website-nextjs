import { slugify } from "@/lib/urls";
import type { Product } from "@/types";

export const PRODUCT_PHOTO_SIZE = 1200;

const STYLE_SVG = /\/images\/products\/(ric|bte|itc|cic|iic|ite)\.svg(?:\?|$)/i;

export function styleIllustrationSrc(style: string) {
  return `/images/products/${style.toLowerCase()}.svg`;
}

export function isPlaceholderProductImage(url: string) {
  if (!url) return true;
  if (url.includes("/images/hero/")) return true;
  if (STYLE_SVG.test(url)) return true;
  return false;
}

export function isStudioProductImage(url: string) {
  return Boolean(url) && !isPlaceholderProductImage(url);
}

export function productPhotoStem(product: {
  brand?: string;
  brandSlug?: string;
  slug?: string;
  name?: string;
}) {
  const brand = slugify(product.brandSlug || product.brand || "");
  const model = slugify(product.slug || product.name || "model");
  if (!brand) return model || "model";
  if (model.startsWith(`${brand}-`) || model === brand) return model;
  return `${brand}-${model}`;
}

export function productPhotoFileName(
  product: { brand?: string; brandSlug?: string; slug?: string; name?: string },
  index: number,
  extra?: string,
) {
  const stem = productPhotoStem(product);
  const order = String(Math.max(1, index)).padStart(2, "0");
  const suffix = extra ? `${slugify(extra)}-` : "";
  return `${stem}-${suffix}${order}-${PRODUCT_PHOTO_SIZE}x${PRODUCT_PHOTO_SIZE}.webp`;
}

export function productPhotoStoragePath(
  product: { brand?: string; brandSlug?: string; slug?: string; name?: string },
  fileName: string,
) {
  const folder = productPhotoStem(product);
  return `${folder}/${fileName}`;
}

/** Same shell in single vs pair, etc. — they usually share one studio photo. */
export function productSeriesKey(product: Pick<Product, "brandSlug" | "type" | "name">) {
  const core = product.name
    .replace(/\s*\((?:1\s*unit|one\s*unit|single|pair|2\s*units|two\s*units)\)/gi, "")
    .replace(/\s+[-–]\s*(single|pair)\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return `${product.brandSlug}::${product.type}::${core}`;
}

export function studioPhotoCount(product: Product) {
  return (
    product.images.filter(isStudioProductImage).length +
    product.colors.reduce((sum, color) => sum + color.images.filter(isStudioProductImage).length, 0)
  );
}

export function resolveProductMedia(input: {
  image: string;
  images: string[];
  styleFallback: string;
}) {
  const studio = [input.image, ...input.images].filter(
    (src, index, list) => isStudioProductImage(src) && list.indexOf(src) === index,
  );
  return {
    image: studio[0] ?? input.styleFallback,
    images: studio,
  };
}
