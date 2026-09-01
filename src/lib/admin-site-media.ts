import { requireAdmin } from "@/lib/admin";
import { clinicImagesFromRows, galleryFromRows, type GalleryPhoto, type SiteImage, type SiteMediaRow } from "@/lib/site-media-shared";
import { defaultClinics } from "@/lib/site-cms/defaults";

export type AdminClinicPhotos = {
  slug: string;
  name: string;
  city: string;
  images: SiteImage[];
};

export type AdminSitePhotos = {
  gallery: GalleryPhoto[];
  clinics: AdminClinicPhotos[];
  ready: boolean;
  error?: string;
};

export async function listAdminSitePhotos(): Promise<AdminSitePhotos> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("site_media")
    .select("id, kind, slot, sort_order, url, alt, storage_path")
    .order("sort_order");

  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return {
      gallery: galleryFromRows([]),
      clinics: defaultClinics()
        .filter((clinic) => !clinic.comingSoon)
        .map((clinic) => ({
          slug: clinic.slug,
          name: clinic.name,
          city: clinic.city,
          images: [],
        })),
      ready: false,
      error: missing
        ? "The photo tables are not on this project yet. Run the latest Supabase migration (site_media) and refresh."
        : error.message,
    };
  }

  const rows = (data ?? []) as SiteMediaRow[];
  const { data: clinicRows } = await supabase
    .from("clinics")
    .select("slug, name, city, coming_soon, published")
    .order("sort_order");
  const clinics = (clinicRows?.length ? clinicRows : defaultClinics()).filter((clinic) => {
    const published = "published" in clinic ? clinic.published !== false : true;
    const comingSoon = Boolean("coming_soon" in clinic ? clinic.coming_soon : clinic.comingSoon);
    return published && !comingSoon;
  });
  return {
    gallery: galleryFromRows(rows),
    clinics: clinics.map((clinic) => ({
      slug: clinic.slug,
      name: clinic.name,
      city: clinic.city,
      images: clinicImagesFromRows(rows, clinic.slug),
    })),
    ready: true,
  };
}
