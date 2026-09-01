import { cache } from "react";
import { revalidatePath, revalidateTag, updateTag, unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { galleryFromRows, type GalleryPhoto, type SiteMediaRow } from "@/lib/site-media-shared";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { ClinicLocation } from "@/types";

export const SITE_MEDIA_TAG = "site-media";

export {
  SITE_IMAGES_BUCKET,
  GALLERY_AREAS,
  GALLERY_SLOTS,
  fallbackGalleryPhotos,
  clinicImagesFromRows,
  galleryFromRows,
  type GalleryArea,
  type SiteMediaKind,
  type SiteMediaRow,
  type SiteImage,
  type GalleryPhoto,
} from "@/lib/site-media-shared";

async function fetchSiteMedia(): Promise<SiteMediaRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("site_media")
    .select("id, kind, slot, sort_order, url, alt, storage_path")
    .order("sort_order");
  if (error) {
    console.error("Failed to load site media", error.message);
    return [];
  }
  return (data ?? []) as SiteMediaRow[];
}

const cachedSiteMedia = unstable_cache(fetchSiteMedia, ["site-media"], {
  tags: [SITE_MEDIA_TAG],
  revalidate: 60,
});

export const listSiteMedia = cache(async () => cachedSiteMedia());

export const getGalleryPhotos = cache(async (): Promise<GalleryPhoto[]> => {
  return galleryFromRows(await listSiteMedia());
});

export const getClinicPhotoMap = cache(async (): Promise<Record<string, string[]>> => {
  const rows = (await listSiteMedia()).filter((row) => row.kind === "clinic");
  const map: Record<string, string[]> = {};
  for (const row of rows) {
    if (!row.url) continue;
    (map[row.slot] ??= []).push(row.url);
  }
  return map;
});

export function withClinicPhotos(
  clinic: ClinicLocation,
  photos: Record<string, string[]>,
): ClinicLocation {
  const images = photos[clinic.slug];
  if (!images?.length) return clinic;
  return { ...clinic, images };
}

export function invalidateSiteMedia() {
  try {
    updateTag(SITE_MEDIA_TAG);
  } catch {
    // updateTag is a Server Action API; revalidateTag still expires the cache.
  }
  revalidateTag(SITE_MEDIA_TAG, "max");
  revalidatePath("/", "layout");
  revalidatePath("/clinics");
  revalidatePath("/admin", "layout");
}
