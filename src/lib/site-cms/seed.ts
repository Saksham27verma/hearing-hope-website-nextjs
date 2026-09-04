import type { SupabaseClient } from "@supabase/supabase-js";
import {
  defaultAwards,
  defaultBrandProfiles,
  defaultClinics,
  defaultFaqs,
  defaultFeaturePages,
  defaultHeroSlides,
  defaultHospitals,
  defaultPages,
  defaultServices,
  defaultSettings,
  defaultStylePages,
  defaultTeam,
  defaultTestimonials,
  settingsPayload,
} from "@/lib/site-cms/defaults";

let seeded = false;
let seedLock: Promise<void> | null = null;

async function empty(supabase: SupabaseClient, table: string) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) return true;
  return !count;
}

async function runSeed(supabase: SupabaseClient) {
  const tables = [
    "site_settings",
    "site_pages",
    "clinics",
    "clinical_services",
    "team_members",
    "hero_slides",
    "faqs",
    "testimonials",
    "awards",
    "hospital_partners",
    "style_pages",
    "feature_pages",
  ] as const;

  const emptiness = await Promise.all(tables.map(async (table) => [table, await empty(supabase, table)] as const));
  const isEmpty = Object.fromEntries(emptiness) as Record<(typeof tables)[number], boolean>;

  const tasks: PromiseLike<unknown>[] = [];

  if (isEmpty.site_settings) {
    tasks.push(supabase.from("site_settings").upsert(settingsPayload(defaultSettings())));
  }

  if (isEmpty.site_pages) {
    tasks.push(
      supabase.from("site_pages").upsert(
        defaultPages().map((page) => ({
          id: page.id,
          meta_title: page.metaTitle,
          meta_description: page.metaDescription,
          fields: page.fields,
        })),
      ),
    );
  }

  if (isEmpty.clinics) {
    tasks.push(
      supabase.from("clinics").insert(
        defaultClinics().map((clinic) => ({
          slug: clinic.slug,
          name: clinic.name,
          city: clinic.city,
          certification: clinic.certification,
          address: clinic.address,
          phone_display: clinic.phoneDisplay,
          phone_tel: clinic.phoneTel,
          hours: clinic.hours,
          lat: clinic.lat,
          lng: clinic.lng,
          blurb: clinic.blurb,
          coming_soon: Boolean(clinic.comingSoon),
          published: clinic.published,
          sort_order: clinic.sortOrder,
        })),
      ),
    );
  }

  if (isEmpty.clinical_services) {
    tasks.push(
      supabase.from("clinical_services").insert(
        defaultServices().map((service) => ({
          slug: service.slug,
          short_name: service.shortName,
          title: service.title,
          category: service.category,
          duration: service.duration,
          excerpt: service.excerpt,
          image: service.image,
          detail_image: service.detailImage,
          icon: service.icon,
          accent: service.accent,
          who: service.who,
          what: service.what,
          expect: service.expect,
          published: service.published,
          sort_order: service.sortOrder,
        })),
      ),
    );
  }

  if (isEmpty.team_members) {
    tasks.push(
      supabase.from("team_members").insert(
        defaultTeam().map((member) => ({
          slug: member.slug,
          honorific: member.honorific,
          name: member.name,
          role: member.role,
          credentials: member.credentials ?? "",
          bio: member.bio,
          image: member.image,
          featured: Boolean(member.featured),
          published: member.published,
          sort_order: member.sortOrder,
        })),
      ),
    );
  }

  if (isEmpty.hero_slides) {
    tasks.push(
      supabase.from("hero_slides").insert(
        defaultHeroSlides().map((slide) => ({
          src: slide.src,
          alt: slide.alt,
          storage_path: slide.storagePath ?? "",
          published: slide.published,
          sort_order: slide.sortOrder,
        })),
      ),
    );
  }

  if (isEmpty.faqs) {
    tasks.push(
      supabase.from("faqs").insert(
        defaultFaqs().map((item) => ({
          question: item.question,
          answer: item.answer,
          page: item.page,
          published: item.published,
          sort_order: item.sortOrder,
        })),
      ),
    );
  }

  if (isEmpty.testimonials) {
    tasks.push(
      supabase.from("testimonials").insert(
        defaultTestimonials().map((item) => ({
          name: item.name,
          city: item.city,
          quote: item.quote,
          product: item.product,
          photo: item.photo,
          photo_alt: item.photoAlt,
          layout: item.layout,
          published: item.published,
          sort_order: item.sortOrder,
        })),
      ),
    );
  }

  if (isEmpty.awards) {
    tasks.push(
      supabase.from("awards").insert(
        defaultAwards().map((item) => ({
          src: item.src,
          alt: item.alt,
          label: item.label,
          published: item.published,
          sort_order: item.sortOrder,
        })),
      ),
    );
  }

  if (isEmpty.hospital_partners) {
    tasks.push(
      supabase.from("hospital_partners").insert(
        defaultHospitals().map((item) => ({
          name: item.name,
          location: item.location,
          logo: item.logo,
          url: item.url,
          focus: item.focus,
          published: item.published,
          sort_order: item.sortOrder,
        })),
      ),
    );
  }

  if (isEmpty.style_pages) {
    tasks.push(
      supabase.from("style_pages").upsert(
        defaultStylePages().map((item) => ({
          id: item.id,
          name: item.name,
          short_name: item.shortName,
          description: item.description,
          headline: item.headline,
          tagline: item.tagline,
          intro: item.intro,
          facts: item.facts,
          points: item.points,
          highlights: item.highlights,
          image: item.image,
          wash: item.wash,
        })),
      ),
    );
  }

  if (isEmpty.feature_pages) {
    tasks.push(
      supabase.from("feature_pages").upsert(
        defaultFeaturePages().map((item) => ({
          id: item.id,
          label: item.label,
          nav_label: item.navLabel,
          tagline: item.tagline,
          body: item.body,
          who: item.who,
          icon: item.icon,
          wash: item.wash,
          headline: item.headline,
          facts: item.facts,
          points: item.points,
          highlights: item.highlights,
          hero_image: item.heroImage,
        })),
      ),
    );
  }

  if (tasks.length) await Promise.all(tasks);

  const profiles = defaultBrandProfiles();
  const { data: brandRows } = await supabase.from("brands").select("id, slug, intro");
  const bySlug = new Map((brandRows ?? []).map((row) => [String(row.slug), row]));
  const updates = profiles.flatMap((profile) => {
    const existing = bySlug.get(profile.slug);
    if (!existing?.id || String(existing.intro ?? "").trim()) return [];
    return [
      supabase
        .from("brands")
        .update({
          tagline: profile.tagline,
          country: profile.country,
          founded: profile.founded,
          headquarters: profile.headquarters,
          parent: profile.parent,
          intro: profile.intro,
          story: profile.story,
          technologies: profile.technologies,
          highlights: profile.highlights,
          logo_url: profile.logo,
        })
        .eq("id", existing.id),
    ];
  });
  if (updates.length) await Promise.all(updates);
}

export async function ensureSiteCmsSeeded(supabase: SupabaseClient) {
  if (seeded) return;
  if (!seedLock) {
    seedLock = runSeed(supabase)
      .then(() => {
        seeded = true;
      })
      .finally(() => {
        seedLock = null;
      });
  }
  return seedLock;
}
