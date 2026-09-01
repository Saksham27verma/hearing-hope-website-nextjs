import { cache } from "react";
import { revalidatePath, revalidateTag, updateTag, unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import {
  defaultAwards,
  defaultBrandProfiles,
  defaultClinics,
  defaultFaqs,
  defaultFeaturePages,
  defaultHeroSlides,
  defaultHospitals,
  defaultServices,
  defaultSettings,
  defaultStylePages,
  defaultTeam,
  defaultTestimonials,
  mapSettingsRow,
} from "@/lib/site-cms/defaults";
import { mergePage } from "@/lib/site-cms/pages";
import { SITE_CMS_TAG, type SitePageId } from "@/lib/site-cms/types";
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
  SitePageDoc,
  SiteSettings,
} from "@/lib/site-cms/types";
import type { BrandProfile, ClinicalService, ClinicLocation, HearingAidFeatureId, HearingAidStyle, HearingAidType } from "@/types";
import { getClinicPhotoMap, withClinicPhotos } from "@/lib/site-media";

function missingTable(message: string) {
  return /does not exist|schema cache|could not find the table/i.test(message);
}

async function fetchTable<T>(table: string, columns: string, order = "sort_order"): Promise<T[] | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createPublicSupabaseClient();
  const query = supabase.from(table).select(columns);
  const { data, error } = order ? await query.order(order) : await query;
  if (error) {
    if (!missingTable(error.message)) console.error(`Failed to load ${table}`, error.message);
    return null;
  }
  return (data ?? []) as T[];
}

function asJsonArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function invalidateSiteCms() {
  try {
    updateTag(SITE_CMS_TAG);
  } catch {
    // revalidateTag still expires the cache
  }
  revalidateTag(SITE_CMS_TAG, "max");
  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/clinics");
  revalidatePath("/services", "layout");
  revalidatePath("/hearing-aids", "layout");
  revalidatePath("/pricing");
  revalidatePath("/blog");
  revalidatePath("/admin", "layout");
}

async function loadSettingsRaw(): Promise<SiteSettings> {
  const rows = await fetchTable<Record<string, unknown>>("site_settings", "*", "");
  if (!rows?.length) return defaultSettings();
  return mapSettingsRow(rows[0]);
}

async function loadPagesRaw(): Promise<Record<string, { meta_title: string; meta_description: string; fields: unknown }>> {
  const rows = await fetchTable<{ id: string; meta_title: string; meta_description: string; fields: unknown }>(
    "site_pages",
    "id, meta_title, meta_description, fields",
    "",
  );
  const map: Record<string, { meta_title: string; meta_description: string; fields: unknown }> = {};
  for (const row of rows ?? []) map[row.id] = row;
  return map;
}

const cachedBundle = unstable_cache(
  async () => {
    const [settings, pages, clinicRows, serviceRows, teamRows, slideRows, faqRows, reviewRows, awardRows, hospitalRows, styleRows, featureRows, brandRows] =
      await Promise.all([
        loadSettingsRaw(),
        loadPagesRaw(),
        fetchTable<Record<string, unknown>>("clinics", "*"),
        fetchTable<Record<string, unknown>>("clinical_services", "*"),
        fetchTable<Record<string, unknown>>("team_members", "*"),
        fetchTable<Record<string, unknown>>("hero_slides", "*"),
        fetchTable<Record<string, unknown>>("faqs", "*"),
        fetchTable<Record<string, unknown>>("testimonials", "*"),
        fetchTable<Record<string, unknown>>("awards", "*"),
        fetchTable<Record<string, unknown>>("hospital_partners", "*"),
        fetchTable<Record<string, unknown>>("style_pages", "*", "id"),
        fetchTable<Record<string, unknown>>("feature_pages", "*", "id"),
        fetchTable<Record<string, unknown>>(
          "brands",
          "id, slug, name, logo_url, sort_order, tagline, country, founded, headquarters, parent, intro, story, technologies, highlights",
          "sort_order",
        ),
      ]);
    return {
      settings,
      pages,
      clinicRows,
      serviceRows,
      teamRows,
      slideRows,
      faqRows,
      reviewRows,
      awardRows,
      hospitalRows,
      styleRows,
      featureRows,
      brandRows,
    };
  },
  ["site-cms-bundle"],
  { tags: [SITE_CMS_TAG], revalidate: 60 },
);

export const getSiteCmsBundle = cache(async () => cachedBundle());

export const getSiteSettings = cache(async (): Promise<SiteSettings> => (await getSiteCmsBundle()).settings);

export const getPage = cache(async <K extends SitePageId>(id: K): Promise<SitePageDoc<K>> => {
  const { pages } = await getSiteCmsBundle();
  return mergePage(id, pages[id] ?? null);
});

export function mapClinic(row: Record<string, unknown>): CmsClinic {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug),
    name: String(row.name),
    city: String(row.city ?? ""),
    certification: String(row.certification ?? ""),
    address: String(row.address ?? ""),
    phoneDisplay: String(row.phone_display ?? ""),
    phoneTel: String(row.phone_tel ?? ""),
    hours: String(row.hours ?? ""),
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
    blurb: String(row.blurb ?? ""),
    images: [],
    comingSoon: Boolean(row.coming_soon),
    published: row.published !== false,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export const listClinics = cache(async (): Promise<CmsClinic[]> => {
  const { clinicRows } = await getSiteCmsBundle();
  const photos = await getClinicPhotoMap();
  const list = clinicRows?.length ? clinicRows.map(mapClinic) : defaultClinics();
  return list.map((clinic) => withClinicPhotos(clinic, photos) as CmsClinic);
});

export const listOpenClinics = cache(async () => (await listClinics()).filter((clinic) => !clinic.comingSoon));
export const listComingSoonClinics = cache(async () => (await listClinics()).filter((clinic) => clinic.comingSoon));

export function mapService(row: Record<string, unknown>): CmsService {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug),
    shortName: String(row.short_name ?? ""),
    title: String(row.title),
    category: String(row.category ?? ""),
    duration: String(row.duration ?? ""),
    excerpt: String(row.excerpt ?? ""),
    image: String(row.image ?? ""),
    detailImage: String(row.detail_image ?? ""),
    icon: (row.icon as CmsService["icon"]) || "activity",
    accent: String(row.accent ?? ""),
    who: String(row.who ?? ""),
    what: String(row.what ?? ""),
    expect: asJsonArray<string>(row.expect, []),
    published: row.published !== false,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export const listServices = cache(async (): Promise<CmsService[]> => {
  const { serviceRows } = await getSiteCmsBundle();
  return serviceRows?.length ? serviceRows.map(mapService) : defaultServices();
});

export const getServiceBySlug = cache(async (slug: string) => {
  return (await listServices()).find((service) => service.slug === slug) ?? null;
});

export const listTeam = cache(async (): Promise<CmsTeamMember[]> => {
  const { teamRows } = await getSiteCmsBundle();
  if (!teamRows?.length) return defaultTeam();
  return teamRows.map((row) => ({
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
});

export const listHeroSlides = cache(async (): Promise<HeroSlide[]> => {
  const { slideRows } = await getSiteCmsBundle();
  if (!slideRows?.length) return defaultHeroSlides();
  return slideRows.map((row) => ({
    id: String(row.id ?? ""),
    src: String(row.src),
    alt: String(row.alt ?? ""),
    storagePath: String(row.storage_path ?? ""),
    sortOrder: Number(row.sort_order ?? 0),
    published: row.published !== false,
  }));
});

export const listFaqs = cache(async (page?: CmsFaq["page"]): Promise<CmsFaq[]> => {
  const { faqRows } = await getSiteCmsBundle();
  const list = faqRows?.length
    ? faqRows.map((row) => ({
        id: String(row.id ?? ""),
        question: String(row.question),
        answer: String(row.answer ?? ""),
        page: (row.page as CmsFaq["page"]) || "all",
        sortOrder: Number(row.sort_order ?? 0),
        published: row.published !== false,
      }))
    : defaultFaqs();
  if (!page) return list;
  return list.filter((item) => item.page === "all" || item.page === page);
});

export const listTestimonials = cache(async (): Promise<CmsTestimonial[]> => {
  const { reviewRows } = await getSiteCmsBundle();
  if (!reviewRows?.length) return defaultTestimonials();
  return reviewRows.map((row) => ({
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
});

export const listAwards = cache(async (): Promise<CmsAward[]> => {
  const { awardRows } = await getSiteCmsBundle();
  if (!awardRows?.length) return defaultAwards();
  return awardRows.map((row) => ({
    id: String(row.id ?? ""),
    src: String(row.src),
    alt: String(row.alt ?? ""),
    label: String(row.label ?? ""),
    sortOrder: Number(row.sort_order ?? 0),
    published: row.published !== false,
  }));
});

export const listHospitals = cache(async (): Promise<CmsHospital[]> => {
  const { hospitalRows } = await getSiteCmsBundle();
  if (!hospitalRows?.length) return defaultHospitals();
  return hospitalRows.map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name),
    location: String(row.location ?? ""),
    logo: String(row.logo ?? ""),
    url: String(row.url ?? ""),
    focus: String(row.focus ?? ""),
    sortOrder: Number(row.sort_order ?? 0),
    published: row.published !== false,
  }));
});

export const listStylePages = cache(async (): Promise<CmsStylePage[]> => {
  const { styleRows } = await getSiteCmsBundle();
  const fallback = defaultStylePages();
  if (!styleRows?.length) return fallback;
  return styleRows.map((row) => {
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
});

export const getStylePage = cache(async (id: HearingAidStyle) => {
  return (await listStylePages()).find((item) => item.id === id) ?? null;
});

export const listFeaturePages = cache(async (): Promise<CmsFeaturePage[]> => {
  const { featureRows } = await getSiteCmsBundle();
  const fallback = defaultFeaturePages();
  if (!featureRows?.length) return fallback;
  return featureRows.map((row) => {
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
});

export const getFeaturePage = cache(async (id: HearingAidFeatureId) => {
  return (await listFeaturePages()).find((item) => item.id === id) ?? null;
});

export const listHearingAidTypes = cache(async (): Promise<HearingAidType[]> => {
  return (await listStylePages()).map((item) => ({
    id: item.id,
    name: item.name,
    shortName: item.shortName,
    description: item.description,
  }));
});

export function mapBrand(row: Record<string, unknown>, fallback: CmsBrandProfile | undefined): CmsBrandProfile {
  const story = asJsonArray<string>(row.story, fallback?.story ?? []);
  const hasStory = story.length > 0 || String(row.intro ?? "").trim();
  if (!hasStory && fallback) {
    return { ...fallback, id: String(row.id ?? fallback.id ?? ""), logo: String(row.logo_url || fallback.logo), sortOrder: Number(row.sort_order ?? fallback.sortOrder) };
  }
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug),
    name: (String(row.name || fallback?.name || "") || "Signia") as CmsBrandProfile["name"],
    logo: String(row.logo_url || fallback?.logo || ""),
    tagline: String(row.tagline || fallback?.tagline || ""),
    country: String(row.country || fallback?.country || ""),
    founded: String(row.founded || fallback?.founded || ""),
    headquarters: String(row.headquarters || fallback?.headquarters || ""),
    parent: String(row.parent || fallback?.parent || ""),
    intro: String(row.intro || fallback?.intro || ""),
    story: story.length ? story : fallback?.story ?? [],
    technologies: asJsonArray(row.technologies, fallback?.technologies ?? []),
    highlights: asJsonArray(row.highlights, fallback?.highlights ?? []),
    sortOrder: Number(row.sort_order ?? fallback?.sortOrder ?? 0),
  };
}

export const listBrandProfiles = cache(async (): Promise<CmsBrandProfile[]> => {
  const { brandRows } = await getSiteCmsBundle();
  const fallback = defaultBrandProfiles();
  if (!brandRows?.length) return fallback;
  return brandRows.map((row) => mapBrand(row, fallback.find((item) => item.slug === row.slug)));
});

export const getBrandBySlug = cache(async (slug: string) => {
  return (await listBrandProfiles()).find((brand) => brand.slug === slug) ?? null;
});

export const getSiteChrome = cache(async () => {
  const [settings, types, features, brands, services, clinics, slides] = await Promise.all([
    getSiteSettings(),
    listStylePages(),
    listFeaturePages(),
    listBrandProfiles(),
    listServices(),
    listClinics(),
    listHeroSlides(),
  ]);
  return { settings, types, features, brands, services, clinics, slides };
});

export function toClinicLocation(clinic: CmsClinic): ClinicLocation {
  const { published: _p, sortOrder: _s, id: _id, ...rest } = clinic;
  return rest;
}

export function toClinicalService(service: CmsService): ClinicalService {
  const { id: _id, detailImage: _d, published: _p, sortOrder: _s, ...rest } = service;
  return rest;
}

export function toBrandProfile(brand: CmsBrandProfile): BrandProfile {
  const { id: _id, sortOrder: _s, ...rest } = brand;
  return rest;
}
