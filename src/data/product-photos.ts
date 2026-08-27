import productPhotoMap from "@/data/product-photos.json";

/** Square size written into converted filenames, e.g. `slug-01-1200x1200.webp`. */
export const PRODUCT_PHOTO_SIZE = 1200;

export const productPhotos = productPhotoMap as Record<string, string[]>;

export function isRecycledHeroPhoto(url: string) {
  return url.includes("/images/hero/");
}

export function photosForProduct(slug: string) {
  return productPhotos[slug] ?? [];
}

export function resolveProductMedia(slug: string, image: string, images: string[]) {
  const studio = photosForProduct(slug);
  if (studio.length) {
    return { image: studio[0], images: studio };
  }

  const cleaned = [image, ...images].filter(
    (src, index, list) => Boolean(src) && !isRecycledHeroPhoto(src) && list.indexOf(src) === index,
  );
  const fallback = cleaned[0] ?? image;

  return {
    image: fallback,
    images: cleaned.length ? cleaned : fallback ? [fallback] : [],
  };
}
