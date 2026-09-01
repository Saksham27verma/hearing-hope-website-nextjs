import { cache } from "react";
import { revalidatePath, revalidateTag, updateTag, unstable_cache } from "next/cache";
import { clinicPhotos } from "@/data/media";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { ClinicLocation } from "@/types";

export const SITE_MEDIA_TAG = "site-media";
export const SITE_IMAGES_BUCKET = "site-images";

export const GALLERY_AREAS = ["one", "two", "three", "four", "five", "six", "seven"] as const;
export type GalleryArea = (typeof GALLERY_AREAS)[number];

export type SiteMediaKind = "gallery" | "clinic";

export type SiteMediaRow = {
  id: string;
  kind: SiteMediaKind;
  slot: string;
  sort_order: number;
  url: string;
  alt: string;
  storage_path: string;
};

export type SiteImage = {
  id?: string;
  url: string;
  alt: string;
  storagePath: string;
};

export type GalleryPhoto = {
  area: GalleryArea;
  src: string;
  alt: string;
  id?: string;
  storagePath?: string;
  isPlaceholder: boolean;
};

export const GALLERY_SLOTS: {
  area: GalleryArea;
  label: string;
  hint: string;
}[] = [
  { area: "one", label: "Large photo", hint: "Left column — first thing visitors see" },
  { area: "two", label: "Bottom-left", hint: "Under the large photo" },
  { area: "three", label: "Top square", hint: "Top row, first small tile" },
  { area: "four", label: "Top square", hint: "Top row, middle small tile" },
  { area: "five", label: "Top square", hint: "Top row, last small tile" },
  { area: "six", label: "Wide centre", hint: "Large photo in the middle" },
  { area: "seven", label: "Tall right", hint: "Right column, two rows" },
];

const fallbackByArea = Object.fromEntries(clinicPhotos.map((photo) => [photo.area, photo])) as Record<
  GalleryArea,
  (typeof clinicPhotos)[number]
>;

export function fallbackGalleryPhotos(): GalleryPhoto[] {
  return GALLERY_SLOTS.map((slot) => {
    const fallback = fallbackByArea[slot.area];
    return {
      area: slot.area,
      src: fallback.src,
      alt: fallback.alt,
      isPlaceholder: true,
    };
  });
}

function mapRow(row: SiteMediaRow): SiteImage {
  return {
    id: row.id,
    url: row.url,
    alt: row.alt,
    storagePath: row.storage_path,
  };
}

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
  const rows = (await listSiteMedia()).filter((row) => row.kind === "gallery");
  const bySlot = new Map(rows.map((row) => [row.slot, row]));
  return GALLERY_SLOTS.map((slot) => {
    const row = bySlot.get(slot.area);
    if (row?.url) {
      return {
        area: slot.area,
        src: row.url,
        alt: row.alt || fallbackByArea[slot.area].alt,
        id: row.id,
        storagePath: row.storage_path,
        isPlaceholder: false,
      };
    }
    const fallback = fallbackByArea[slot.area];
    return {
      area: slot.area,
      src: fallback.src,
      alt: fallback.alt,
      isPlaceholder: true,
    };
  });
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

export function clinicImagesFromRows(rows: SiteMediaRow[], slug: string): SiteImage[] {
  return rows
    .filter((row) => row.kind === "clinic" && row.slot === slug)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapRow);
}

export function galleryFromRows(rows: SiteMediaRow[]): GalleryPhoto[] {
  const bySlot = new Map(rows.filter((row) => row.kind === "gallery").map((row) => [row.slot, row]));
  return GALLERY_SLOTS.map((slot) => {
    const row = bySlot.get(slot.area);
    if (row?.url) {
      return {
        area: slot.area,
        src: row.url,
        alt: row.alt || fallbackByArea[slot.area].alt,
        id: row.id,
        storagePath: row.storage_path,
        isPlaceholder: false,
      };
    }
    const fallback = fallbackByArea[slot.area];
    return {
      area: slot.area,
      src: fallback.src,
      alt: fallback.alt,
      isPlaceholder: true,
    };
  });
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
