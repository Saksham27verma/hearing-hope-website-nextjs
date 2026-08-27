"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  PRODUCT_PHOTO_SIZE,
  productPhotoFileName,
  productPhotoStoragePath,
} from "@/lib/product-photo";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/tiff"]);

export type PhotoProductRef = {
  id?: string;
  brand?: string;
  brandSlug?: string;
  slug?: string;
  name?: string;
};

export async function convertToProductWebp(file: File): Promise<Blob> {
  if (file.type && !ALLOWED.has(file.type) && !file.type.startsWith("image/")) {
    throw new Error("Use PNG, JPG or WebP photos.");
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = PRODUCT_PHOTO_SIZE;
  canvas.height = PRODUCT_PHOTO_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not prepare the photo.");
  }

  const keepAlpha = file.type === "image/png" || file.type === "image/webp";
  if (!keepAlpha) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, PRODUCT_PHOTO_SIZE, PRODUCT_PHOTO_SIZE);
  }

  const scale = Math.min(PRODUCT_PHOTO_SIZE / bitmap.width, PRODUCT_PHOTO_SIZE / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  ctx.drawImage(bitmap, (PRODUCT_PHOTO_SIZE - width) / 2, (PRODUCT_PHOTO_SIZE - height) / 2, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.82);
  });
  if (!blob) throw new Error("Could not convert the photo to WebP.");
  return blob;
}

export async function uploadProductWebp(path: string, blob: Blob) {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from("product-images").upload(path, blob, {
    cacheControl: "31536000",
    upsert: true,
    contentType: "image/webp",
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

  onProgress?.("Converting to WebP…");
  const blobs = [];
  for (const [index, file] of files.entries()) {
    onProgress?.(`Converting photo ${index + 1} of ${files.length}…`);
    blobs.push(await convertToProductWebp(file));
  }

  const assignments: { productId?: string; images: { url: string; alt: string }[] }[] = [];

  for (const [productIndex, product] of products.entries()) {
    const images: { url: string; alt: string }[] = [];
    const baseIndex = typeof startIndex === "function" ? startIndex(product) : startIndex;
    for (const [fileIndex, blob] of blobs.entries()) {
      const fileName = productPhotoFileName(product, baseIndex + fileIndex, extra);
      const path = productPhotoStoragePath(product, fileName);
      onProgress?.(
        products.length > 1
          ? `Saving ${product.name ?? "model"} (${productIndex + 1}/${products.length})…`
          : `Uploading ${fileName}…`,
      );
      const url = await uploadProductWebp(path, blob);
      const brand = product.brand?.trim();
      const name = product.name?.trim();
      images.push({
        url,
        alt: [brand, name].filter(Boolean).join(" ") || fileName,
      });
    }
    assignments.push({ productId: product.id, images });
  }

  return assignments;
}
