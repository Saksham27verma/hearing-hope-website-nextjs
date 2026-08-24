import type { Product } from "@/types";

export function productGallery(product: Product, colorId?: string | null) {
  if (colorId) {
    const color = product.colors.find((item) => item.id === colorId);
    if (color?.images.length) return color.images;
  }
  if (product.images.length) return product.images;
  const defaultColor = product.colors.find((item) => item.isDefault) ?? product.colors[0];
  if (defaultColor?.images.length) return defaultColor.images;
  return product.image ? [product.image] : [];
}

export function isRemoteImage(src: string) {
  return src.startsWith("https://") || src.startsWith("http://");
}
