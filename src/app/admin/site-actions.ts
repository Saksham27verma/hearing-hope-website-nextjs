"use server";

import { requireAdmin } from "@/lib/admin";
import { invalidateSiteCms } from "@/lib/site-cms";
import { settingsPayload } from "@/lib/site-cms/defaults";
import type { SitePageId, SiteSettings } from "@/lib/site-cms/types";
import { slugify } from "@/lib/urls";

export type CmsActionResult = { ok: true; id: string } | { ok: false; error: string };

function fail(error: unknown): CmsActionResult {
  return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
}

export async function saveSiteSettings(input: SiteSettings): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("site_settings").upsert(settingsPayload(input));
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id: "default" };
  } catch (error) {
    return fail(error);
  }
}

export async function saveSitePage(input: {
  id: SitePageId;
  metaTitle: string;
  metaDescription: string;
  fields: unknown;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("site_pages").upsert({
      id: input.id,
      meta_title: input.metaTitle,
      meta_description: input.metaDescription,
      fields: input.fields,
    });
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id: input.id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveClinic(input: {
  id?: string;
  slug: string;
  name: string;
  city: string;
  certification: string;
  address: string;
  phoneDisplay: string;
  phoneTel: string;
  hours: string;
  lat: number;
  lng: number;
  blurb: string;
  comingSoon: boolean;
  published: boolean;
  sortOrder: number;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const slug = slugify(input.slug || input.name);
    if (!input.name.trim()) return { ok: false, error: "Clinic name is required." };
    const payload = {
      slug,
      name: input.name.trim(),
      city: input.city.trim(),
      certification: input.certification.trim(),
      address: input.address.trim(),
      phone_display: input.phoneDisplay.trim(),
      phone_tel: input.phoneTel.trim(),
      hours: input.hours.trim(),
      lat: input.lat,
      lng: input.lng,
      blurb: input.blurb.trim(),
      coming_soon: input.comingSoon,
      published: input.published,
      sort_order: input.sortOrder,
    };
    if (input.id) {
      const { error } = await supabase.from("clinics").update(payload).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      invalidateSiteCms();
      return { ok: true, id: input.id };
    }
    const { data, error } = await supabase.from("clinics").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not save clinic." };
    invalidateSiteCms();
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteClinic(id: string): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("clinics").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveService(input: {
  id?: string;
  slug: string;
  shortName: string;
  title: string;
  category: string;
  duration: string;
  excerpt: string;
  image: string;
  detailImage: string;
  icon: string;
  accent: string;
  who: string;
  what: string;
  expect: string[];
  published: boolean;
  sortOrder: number;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const slug = slugify(input.slug || input.title);
    if (!input.title.trim()) return { ok: false, error: "Service title is required." };
    const payload = {
      slug,
      short_name: input.shortName.trim(),
      title: input.title.trim(),
      category: input.category.trim(),
      duration: input.duration.trim(),
      excerpt: input.excerpt.trim(),
      image: input.image.trim(),
      detail_image: input.detailImage.trim(),
      icon: input.icon,
      accent: input.accent,
      who: input.who.trim(),
      what: input.what.trim(),
      expect: input.expect,
      published: input.published,
      sort_order: input.sortOrder,
    };
    if (input.id) {
      const { error } = await supabase.from("clinical_services").update(payload).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      invalidateSiteCms();
      return { ok: true, id: input.id };
    }
    const { data, error } = await supabase.from("clinical_services").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not save service." };
    invalidateSiteCms();
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteService(id: string): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("clinical_services").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveTeamMember(input: {
  id?: string;
  slug: string;
  honorific: string;
  name: string;
  role: string;
  credentials: string;
  bio: string;
  image: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const slug = slugify(input.slug || input.name);
    if (!input.name.trim()) return { ok: false, error: "Name is required." };
    const payload = {
      slug,
      honorific: input.honorific.trim(),
      name: input.name.trim(),
      role: input.role.trim(),
      credentials: input.credentials.trim(),
      bio: input.bio.trim(),
      image: input.image.trim(),
      featured: input.featured,
      published: input.published,
      sort_order: input.sortOrder,
    };
    if (input.id) {
      const { error } = await supabase.from("team_members").update(payload).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      invalidateSiteCms();
      return { ok: true, id: input.id };
    }
    const { data, error } = await supabase.from("team_members").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not save team member." };
    invalidateSiteCms();
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTeamMember(id: string): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveHeroSlide(input: {
  id?: string;
  src: string;
  alt: string;
  storagePath?: string;
  published: boolean;
  sortOrder: number;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const payload = {
      src: input.src.trim(),
      alt: input.alt.trim(),
      storage_path: input.storagePath?.trim() ?? "",
      published: input.published,
      sort_order: input.sortOrder,
    };
    if (!payload.src) return { ok: false, error: "Upload a photo first." };
    if (input.id) {
      const { error } = await supabase.from("hero_slides").update(payload).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      invalidateSiteCms();
      return { ok: true, id: input.id };
    }
    const { data, error } = await supabase.from("hero_slides").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not save slide." };
    invalidateSiteCms();
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteHeroSlide(id: string): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveFaq(input: {
  id?: string;
  question: string;
  answer: string;
  page: string;
  published: boolean;
  sortOrder: number;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.question.trim()) return { ok: false, error: "Question is required." };
    const payload = {
      question: input.question.trim(),
      answer: input.answer.trim(),
      page: input.page || "all",
      published: input.published,
      sort_order: input.sortOrder,
    };
    if (input.id) {
      const { error } = await supabase.from("faqs").update(payload).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      invalidateSiteCms();
      return { ok: true, id: input.id };
    }
    const { data, error } = await supabase.from("faqs").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not save FAQ." };
    invalidateSiteCms();
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFaq(id: string): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveTestimonial(input: {
  id?: string;
  name: string;
  city: string;
  quote: string;
  product: string;
  photo: string;
  photoAlt: string;
  layout: string;
  published: boolean;
  sortOrder: number;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.name.trim() || !input.quote.trim()) return { ok: false, error: "Name and quote are required." };
    const payload = {
      name: input.name.trim(),
      city: input.city.trim(),
      quote: input.quote.trim(),
      product: input.product.trim(),
      photo: input.photo.trim(),
      photo_alt: input.photoAlt.trim(),
      layout: input.layout || "simple",
      published: input.published,
      sort_order: input.sortOrder,
    };
    if (input.id) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      invalidateSiteCms();
      return { ok: true, id: input.id };
    }
    const { data, error } = await supabase.from("testimonials").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not save review." };
    invalidateSiteCms();
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTestimonial(id: string): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveAward(input: {
  id?: string;
  src: string;
  alt: string;
  label: string;
  published: boolean;
  sortOrder: number;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.src.trim()) return { ok: false, error: "Upload an award image." };
    const payload = {
      src: input.src.trim(),
      alt: input.alt.trim(),
      label: input.label.trim(),
      published: input.published,
      sort_order: input.sortOrder,
    };
    if (input.id) {
      const { error } = await supabase.from("awards").update(payload).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      invalidateSiteCms();
      return { ok: true, id: input.id };
    }
    const { data, error } = await supabase.from("awards").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not save award." };
    invalidateSiteCms();
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteAward(id: string): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("awards").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveHospital(input: {
  id?: string;
  name: string;
  location: string;
  logo: string;
  url: string;
  focus: string;
  published: boolean;
  sortOrder: number;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.name.trim()) return { ok: false, error: "Hospital name is required." };
    const payload = {
      name: input.name.trim(),
      location: input.location.trim(),
      logo: input.logo.trim(),
      url: input.url.trim(),
      focus: input.focus.trim(),
      published: input.published,
      sort_order: input.sortOrder,
    };
    if (input.id) {
      const { error } = await supabase.from("hospital_partners").update(payload).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      invalidateSiteCms();
      return { ok: true, id: input.id };
    }
    const { data, error } = await supabase.from("hospital_partners").insert(payload).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not save partner." };
    invalidateSiteCms();
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteHospital(id: string): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("hospital_partners").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveStylePage(input: {
  id: string;
  name: string;
  shortName: string;
  description: string;
  headline: string;
  tagline: string;
  intro: string;
  facts: { label: string; value: string }[];
  points: { title: string; body: string }[];
  highlights: string[];
  image: string;
  wash: string;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("style_pages").upsert({
      id: input.id,
      name: input.name.trim(),
      short_name: input.shortName.trim(),
      description: input.description.trim(),
      headline: input.headline.trim(),
      tagline: input.tagline.trim(),
      intro: input.intro.trim(),
      facts: input.facts,
      points: input.points,
      highlights: input.highlights,
      image: input.image.trim(),
      wash: input.wash.trim(),
    });
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id: input.id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveFeaturePage(input: {
  id: string;
  label: string;
  navLabel: string;
  tagline: string;
  body: string;
  who: string;
  icon: string;
  wash: string;
  headline: string;
  facts: { label: string; value: string }[];
  points: { title: string; body: string }[];
  highlights: string[];
  heroImage: string;
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("feature_pages").upsert({
      id: input.id,
      label: input.label.trim(),
      nav_label: input.navLabel.trim(),
      tagline: input.tagline.trim(),
      body: input.body.trim(),
      who: input.who.trim(),
      icon: input.icon,
      wash: input.wash.trim(),
      headline: input.headline.trim(),
      facts: input.facts,
      points: input.points,
      highlights: input.highlights,
      hero_image: input.heroImage.trim(),
    });
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    return { ok: true, id: input.id };
  } catch (error) {
    return fail(error);
  }
}

export async function saveBrandStory(input: {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  sortOrder: number;
  tagline: string;
  country: string;
  founded: string;
  headquarters: string;
  parent: string;
  intro: string;
  story: string[];
  technologies: { title: string; body: string }[];
  highlights: string[];
}): Promise<CmsActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const slug = slugify(input.slug || input.name);
    const { error } = await supabase
      .from("brands")
      .update({
        name: input.name.trim(),
        slug,
        logo_url: input.logoUrl.trim(),
        sort_order: input.sortOrder,
        tagline: input.tagline.trim(),
        country: input.country.trim(),
        founded: input.founded.trim(),
        headquarters: input.headquarters.trim(),
        parent: input.parent.trim(),
        intro: input.intro.trim(),
        story: input.story,
        technologies: input.technologies,
        highlights: input.highlights,
      })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    invalidateSiteCms();
    const { invalidateCatalog } = await import("@/lib/catalog");
    invalidateCatalog();
    return { ok: true, id: input.id };
  } catch (error) {
    return fail(error);
  }
}
