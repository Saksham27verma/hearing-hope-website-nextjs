"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  PRODUCT_PHOTO_SIZE,
  productPhotoFileName,
  productPhotoStoragePath,
} from "@/lib/product-photo";
import { convertForWebsite, type WebImageResult } from "@/lib/web-image-client";

export type PhotoProductRef = {
  id?: string;
  brand?: string;
  brandSlug?: string;
  slug?: string;
  name?: string;
};

export async function convertToProductImage(file: File): Promise<WebImageResult> {
  return convertForWebsite(file, {
    canvasWidth: PRODUCT_PHOTO_SIZE,
    canvasHeight: PRODUCT_PHOTO_SIZE,
    background: "#ffffff",
    keepSvg: false,
  });
}

export async function uploadProductImage(path: string, image: WebImageResult) {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from("product-images").upload(path, image.blob, {
    cacheControl: "31536000",
    upsert: true,
    contentType: image.mime,
  });
  if (error) throw error;
  return `${supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
}

export async function prepareAndUploadProductPhotos({
  files,
  products,
  startIndex = 1,
  extra,
  onProgress,
}: {
  files: File[];
  products: PhotoProductRef[];
  startIndex?: number | ((product: PhotoProductRef) => number);
  extra?: string;
  onProgress?: (label: string) => void;
}) {
  if (!files.length) return [];
  if (!products.length) throw new Error("Select at least one hearing aid.");

  onProgress?.("Optimising photos…");
  const images: WebImageResult[] = [];
  for (const [index, file] of files.entries()) {
    onProgress?.(`Converting photo ${index + 1} of ${files.length}…`);
    images.push(await convertToProductImage(file));
  }

  const assignments: { productId?: string; images: { url: string; alt: string }[] }[] = [];

  for (const [productIndex, product] of products.entries()) {
    const uploaded: { url: string; alt: string }[] = [];
    const baseIndex = typeof startIndex === "function" ? startIndex(product) : startIndex;
    for (const [fileIndex, image] of images.entries()) {
      const fileName = productPhotoFileName(product, baseIndex + fileIndex, extra, image.extension);
      const path = productPhotoStoragePath(product, fileName);
      onProgress?.(
        products.length > 1
          ? `Saving ${product.name ?? "model"} (${productIndex + 1}/${products.length})…`
          : `Uploading ${fileName}…`,
      );
      const url = await uploadProductImage(path, image);
      const brand = product.brand?.trim();
      const name = product.name?.trim();
      uploaded.push({
        url,
        alt: [brand, name].filter(Boolean).join(" ") || fileName,
      });
    }
    assignments.push({ productId: product.id, images: uploaded });
  }

  return assignments;
}
