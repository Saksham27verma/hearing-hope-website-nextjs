"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SITE_IMAGES_BUCKET } from "@/lib/site-media-shared";
import { slugify } from "@/lib/urls";
import { convertForWebsite, type WebImageResult } from "@/lib/web-image-client";

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1440;

export async function convertToSiteImage(file: File): Promise<WebImageResult> {
  return convertForWebsite(file, {
    maxWidth: MAX_WIDTH,
    maxHeight: MAX_HEIGHT,
    background: "#f8fafc",
    keepSvg: true,
  });
}

export async function uploadSiteImage(path: string, image: WebImageResult): Promise<string> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from(SITE_IMAGES_BUCKET).upload(path, image.blob, {
    cacheControl: "31536000",
    upsert: true,
    contentType: image.mime,
  });
  if (error) throw error;
  return `${supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
}

export async function uploadGalleryPhoto(area: string, file: File) {
  const image = await convertToSiteImage(file);
  const path = `gallery/${slugify(area) || area}.${image.extension}`;
  const url = await uploadSiteImage(path, image);
  return { url, path, image };
}

export async function uploadCmsImage(folder: string, file: File) {
  const image = await convertToSiteImage(file);
  const path = `${slugify(folder) || "cms"}/${Date.now()}.${image.extension}`;
  const url = await uploadSiteImage(path, image);
  return { url, path, image };
}

export async function uploadClinicPhotos(slug: string, files: File[], startIndex: number) {
  const stem = slugify(slug) || "clinic";
  const uploaded: { url: string; path: string; image: WebImageResult }[] = [];
  for (const [index, file] of files.entries()) {
    const image = await convertToSiteImage(file);
    const path = `clinics/${stem}/${String(startIndex + index).padStart(2, "0")}-${Date.now()}.${image.extension}`;
    const url = await uploadSiteImage(path, image);
    uploaded.push({ url, path, image });
  }
  return uploaded;
}
