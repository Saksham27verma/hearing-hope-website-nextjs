import { requireAdmin } from "@/lib/admin";
import { ensureSiteCmsSeeded } from "@/lib/site-cms/seed";
import { mergePage, SITE_PAGE_IDS } from "@/lib/site-cms/pages";
import {
  defaultAwards,
  defaultBrandProfiles,
  defaultClinics,
  defaultFaqs,
  defaultFeaturePages,
  defaultHeroSlides,
  defaultHospitals,
  defaultServices,
  defaultStylePages,
  defaultTeam,
  defaultTestimonials,
  mapSettingsRow,
} from "@/lib/site-cms/defaults";
import { mapBrand, mapClinic, mapService } from "@/lib/site-cms";
import type { SitePageId } from "@/lib/site-cms/types";
import type {
  CmsAward,
  CmsBrandProfile,
  CmsClinic,
  CmsFaq,
  CmsFeaturePage,
  CmsHospital,
  CmsService,
  CmsStylePage,
  CmsTeamMember,
  CmsTestimonial,
  HeroSlide,
} from "@/lib/site-cms/types";
import type { HearingAidFeatureId, HearingAidStyle } from "@/types";
import { getClinicPhotoMap, withClinicPhotos } from "@/lib/site-media";
import { listAdminSitePhotos } from "@/lib/admin-site-media";

function asJsonArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export async function loadAdminCms() {
  const { supabase } = await requireAdmin();
  try {
    await ensureSiteCmsSeeded(supabase);
  } catch (error) {
    console.error("CMS seed skipped", error instanceof Error ? error.message : error);
  }
}

async function adminRows(table: string, columns = "*", order = "sort_order") {
  await loadAdminCms();
  const { supabase } = await requireAdmin();
  const query = supabase.from(table).select(columns);
  const { data, error } = order ? await query.order(order) : await query;
  if (error) {
    if (!/does not exist|schema cache/i.test(error.message)) console.error(`Admin load ${table}`, error.message);
    return null;
  }
  return ((data ?? []) as unknown as Record<string, unknown>[]);
}

export async function getAdminSettings() {
  await loadAdminCms();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();
  return mapSettingsRow(data as Record<string, unknown> | null);
}

export async function getAdminPage(id: SitePageId) {
  await loadAdminCms();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_pages").select("*").eq("id", id).maybeSingle();
  return mergePage(id, data);
}

export async function listAdminPages() {
  await loadAdminCms();
  return Promise.all(SITE_PAGE_IDS.map((id) => getAdminPage(id)));
}

export async function listAdminClinics(): Promise<CmsClinic[]> {
  const rows = await adminRows("clinics");
  const photos = await getClinicPhotoMap();
  const list = rows?.length ? rows.map(mapClinic) : defaultClinics();
  return list.map((clinic) => withClinicPhotos(clinic, photos) as CmsClinic);
}

export async function getAdminClinic(id: string) {
  const clinics = await listAdminClinics();
  return clinics.find((clinic) => clinic.id === id || clinic.slug === id) ?? null;
}

export async function listAdminServices(): Promise<CmsService[]> {
  const rows = await adminRows("clinical_services");
  return rows?.length ? rows.map(mapService) : defaultServices();
}

export async function getAdminService(id: string) {
  const services = await listAdminServices();
  return services.find((service) => service.id === id || service.slug === id) ?? null;
}

export async function listAdminTeam(): Promise<CmsTeamMember[]> {
  const rows = await adminRows("team_members");
  if (!rows?.length) return defaultTeam();
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    slug: String(row.slug),
    honorific: String(row.honorific ?? ""),
    name: String(row.name),
    role: String(row.role ?? ""),
    credentials: String(row.credentials ?? "") || undefined,
    bio: String(row.bio ?? ""),
    image: String(row.image ?? ""),
    featured: Boolean(row.featured),
    published: row.published !== false,
    sortOrder: Number(row.sort_order ?? 0),
  }));
}

export async function getAdminTeamMember(id: string) {
  const members = await listAdminTeam();
  return members.find((member) => member.id === id || member.slug === id) ?? null;
}

export async function listAdminHeroSlides(): Promise<HeroSlide[]> {
  const rows = await adminRows("hero_slides");
  if (!rows?.length) return defaultHeroSlides();
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    src: String(row.src),
    alt: String(row.alt ?? ""),
    storagePath: String(row.storage_path ?? ""),
    sortOrder: Number(row.sort_order ?? 0),
    published: row.published !== false,
  }));
}

export async function listAdminFaqs(): Promise<CmsFaq[]> {
  const rows = await adminRows("faqs");
  if (!rows?.length) return defaultFaqs();
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    question: String(row.question),
    answer: String(row.answer ?? ""),
    page: (row.page as CmsFaq["page"]) || "all",
    sortOrder: Number(row.sort_order ?? 0),
    published: row.published !== false,
  }));
}

export async function listAdminTestimonials(): Promise<CmsTestimonial[]> {
  const rows = await adminRows("testimonials");
  if (!rows?.length) return defaultTestimonials();
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name),
    city: String(row.city ?? ""),
    quote: String(row.quote ?? ""),
    product: String(row.product ?? ""),
    photo: String(row.photo ?? ""),
    photoAlt: String(row.photo_alt ?? ""),
    layout: String(row.layout ?? "simple"),
    sortOrder: Number(row.sort_order ?? 0),
    published: row.published !== false,
  }));
}

export async function listAdminAwards(): Promise<CmsAward[]> {
  const rows = await adminRows("awards");
  if (!rows?.length) return defaultAwards();
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    src: String(row.src),
    alt: String(row.alt ?? ""),
    label: String(row.label ?? ""),
    sortOrder: Number(row.sort_order ?? 0),
    published: row.published !== false,
  }));
}

export async function listAdminHospitals(): Promise<CmsHospital[]> {
  const rows = await adminRows("hospital_partners");
  if (!rows?.length) return defaultHospitals();
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name),
    location: String(row.location ?? ""),
    logo: String(row.logo ?? ""),
    url: String(row.url ?? ""),
    focus: String(row.focus ?? ""),
    sortOrder: Number(row.sort_order ?? 0),
    published: row.published !== false,
  }));
}

export async function listAdminStylePages(): Promise<CmsStylePage[]> {
  const rows = await adminRows("style_pages", "*", "id");
  const fallback = defaultStylePages();
  if (!rows?.length) return fallback;
  return rows.map((row) => {
    const id = row.id as HearingAidStyle;
    const base = fallback.find((item) => item.id === id);
    return {
      id,
      name: String(row.name || base?.name || id),
      shortName: String(row.short_name || base?.shortName || id),
      description: String(row.description || base?.description || ""),
      headline: String(row.headline || base?.headline || ""),
      tagline: String(row.tagline || base?.tagline || ""),
      intro: String(row.intro || base?.intro || ""),
      facts: asJsonArray(row.facts, base?.facts ?? []),
      points: asJsonArray(row.points, base?.points ?? []),
      highlights: asJsonArray(row.highlights, base?.highlights ?? []),
      image: String(row.image || base?.image || ""),
      wash: String(row.wash || base?.wash || ""),
    };
  });
}

export async function getAdminStylePage(id: string) {
  const pages = await listAdminStylePages();
  return pages.find((page) => page.id === id) ?? null;
}

export async function listAdminFeaturePages(): Promise<CmsFeaturePage[]> {
  const rows = await adminRows("feature_pages", "*", "id");
  const fallback = defaultFeaturePages();
  if (!rows?.length) return fallback;
  return rows.map((row) => {
    const id = row.id as HearingAidFeatureId;
    const base = fallback.find((item) => item.id === id);
    return {
      id,
      label: String(row.label || base?.label || id),
      navLabel: String(row.nav_label || base?.navLabel || id),
      tagline: String(row.tagline || base?.tagline || ""),
      body: String(row.body || base?.body || ""),
      who: String(row.who || base?.who || ""),
      icon: (row.icon as CmsFeaturePage["icon"]) || base?.icon || "battery",
      wash: String(row.wash || base?.wash || ""),
      headline: String(row.headline || base?.headline || ""),
      facts: asJsonArray(row.facts, base?.facts ?? []),
      points: asJsonArray(row.points, base?.points ?? []),
      highlights: asJsonArray(row.highlights, base?.highlights ?? []),
      heroImage: String(row.hero_image || base?.heroImage || ""),
    };
  });
}

export async function getAdminFeaturePage(id: string) {
  const pages = await listAdminFeaturePages();
  return pages.find((page) => page.id === id) ?? null;
}

export async function listAdminBrandProfiles(): Promise<CmsBrandProfile[]> {
  const rows = await adminRows(
    "brands",
    "id, slug, name, logo_url, sort_order, tagline, country, founded, headquarters, parent, intro, story, technologies, highlights",
    "sort_order",
  );
  const fallback = defaultBrandProfiles();
  if (!rows?.length) return fallback;
  return rows.map((row) => mapBrand(row, fallback.find((item) => item.slug === row.slug)));
}

export async function getAdminBrandProfile(id: string) {
  const brands = await listAdminBrandProfiles();
  return brands.find((brand) => brand.id === id || brand.slug === id) ?? null;
}

export async function getAdminHomeBundle() {
  await loadAdminCms();
  const [page, slides, photos, settings] = await Promise.all([
    getAdminPage("home"),
    listAdminHeroSlides(),
    listAdminSitePhotos(),
    getAdminSettings(),
  ]);
  return { page, slides, photos, settings };
}
