"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/urls";
import { convertForWebsite } from "@/lib/web-image-client";

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 900;

export async function uploadBlogCover(slug: string, file: File): Promise<string> {
  const image = await convertForWebsite(file, {
    maxWidth: MAX_WIDTH,
    maxHeight: MAX_HEIGHT,
    background: "#ffffff",
    keepSvg: true,
  });
  const stem = slugify(slug) || "article";
  const path = `covers/${stem}-${Date.now()}.${image.extension}`;
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from("blog-images").upload(path, image.blob, {
    cacheControl: "31536000",
    upsert: true,
    contentType: image.mime,
  });
  if (error) throw error;
  return `${supabase.storage.from("blog-images").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
}
