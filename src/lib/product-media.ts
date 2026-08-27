import { isPlaceholderProductImage } from "@/lib/product-photo";
import type { Product } from "@/types";

function studioOnly(urls: string[]) {
  return urls.filter((src) => src && !isPlaceholderProductImage(src));
}

export function productGallery(product: Product, colorId?: string | null) {
  if (colorId) {
    const color = product.colors.find((item) => item.id === colorId);
    const colorShots = studioOnly(color?.images ?? []);
    if (colorShots.length) return colorShots;
  }
  if (product.images.length) {
    const shots = studioOnly(product.images);
    if (shots.length) return shots;
  }
  const defaultColor = product.colors.find((item) => item.isDefault) ?? product.colors[0];
  const defaultShots = studioOnly(defaultColor?.images ?? []);
  if (defaultShots.length) return defaultShots;
  return studioOnly(product.image ? [product.image] : []).length
    ? studioOnly([product.image])
    : product.image
      ? [product.image]
      : [];
}

export function isRemoteImage(src: string) {
  return src.startsWith("https://") || src.startsWith("http://");
}
