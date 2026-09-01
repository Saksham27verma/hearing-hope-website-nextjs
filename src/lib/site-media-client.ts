"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SITE_IMAGES_BUCKET } from "@/lib/site-media-shared";
import { slugify } from "@/lib/urls";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/tiff"]);
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1440;

export async function convertToSiteWebp(file: File): Promise<Blob> {
  if (file.type && !ALLOWED.has(file.type) && !file.type.startsWith("image/")) {
    throw new Error("Use PNG, JPG or WebP photos.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not prepare the photo.");
  }

  const keepAlpha = file.type === "image/png" || file.type === "image/webp";
  if (!keepAlpha) {
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.84);
  });
  if (!blob) throw new Error("Could not convert the photo to WebP.");
  return blob;
}

export async function uploadSiteImage(path: string, blob: Blob): Promise<string> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from(SITE_IMAGES_BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    upsert: true,
    contentType: "image/webp",
  });
  if (error) throw error;
  return `${supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
}

export async function uploadGalleryPhoto(area: string, file: File): Promise<{ url: string; path: string }> {
  const blob = await convertToSiteWebp(file);
  const path = `gallery/${slugify(area) || area}.webp`;
  const url = await uploadSiteImage(path, blob);
  return { url, path };
}

export async function uploadClinicPhotos(
  slug: string,
  files: File[],
  startIndex: number,
): Promise<{ url: string; path: string }[]> {
  const stem = slugify(slug) || "clinic";
  const uploaded: { url: string; path: string }[] = [];
  for (const [index, file] of files.entries()) {
    const blob = await convertToSiteWebp(file);
    const path = `clinics/${stem}/${String(startIndex + index).padStart(2, "0")}-${Date.now()}.webp`;
    const url = await uploadSiteImage(path, blob);
    uploaded.push({ url, path });
  }
  return uploaded;
}
