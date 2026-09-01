import { clinicPhotos } from "@/data/media";

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
  size: string;
}[] = [
  { area: "one", label: "Large photo", hint: "Left column — first thing visitors see", size: "1200 × 1600 px" },
  { area: "two", label: "Bottom-left", hint: "Under the large photo", size: "1200 × 800 px" },
  { area: "three", label: "Top square", hint: "Top row, first small tile", size: "900 × 700 px" },
  { area: "four", label: "Top square", hint: "Top row, middle small tile", size: "900 × 700 px" },
  { area: "five", label: "Top square", hint: "Top row, last small tile", size: "900 × 700 px" },
  { area: "six", label: "Wide centre", hint: "Large photo in the middle", size: "1600 × 1200 px" },
  { area: "seven", label: "Tall right", hint: "Right column, two rows", size: "800 × 1600 px" },
];

export const CLINIC_PHOTO_SIZE = "1600 × 900 px";

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
