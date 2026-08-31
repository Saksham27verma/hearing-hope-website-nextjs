"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/urls";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/tiff"]);
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 900;

export async function convertToBlogWebp(file: File): Promise<Blob> {
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
    ctx.fillStyle = "#ffffff";
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

export async function uploadBlogCover(slug: string, file: File): Promise<string> {
  const blob = await convertToBlogWebp(file);
  const stem = slugify(slug) || "article";
  const path = `covers/${stem}-${Date.now()}.webp`;
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from("blog-images").upload(path, blob, {
    cacheControl: "31536000",
    upsert: true,
    contentType: "image/webp",
  });
  if (error) throw error;
  return `${supabase.storage.from("blog-images").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
}
