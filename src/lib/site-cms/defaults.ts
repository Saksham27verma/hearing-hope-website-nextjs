import { brandProfiles } from "@/data/brands";
import { clinics } from "@/data/clinics";
import { faqs, hearingAidTypes, hospitalPartners } from "@/data/content";
import { hearingAidFeaturePages, hearingAidTypePages } from "@/data/hearing-aid-collections";
import { hearingAidFeatures, hearingAidTypeVisuals } from "@/data/hearing-aids";
import { awards, heroSlides } from "@/data/media";
import { clinicalServices } from "@/data/services";
import { site } from "@/lib/site";
import { team } from "@/data/team";
import { defaultPage, SITE_PAGE_IDS } from "@/lib/site-cms/pages";
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
  SiteSettings,
} from "@/lib/site-cms/types";

export function defaultSettings(): SiteSettings {
  return {
    name: site.name,
    tagline: site.tagline,
    description: site.description,
    url: site.url,
    phoneDisplay: site.phoneDisplay,
    phoneTel: site.phoneTel,
    whatsappNumber: site.whatsappNumber,
    email: site.email,
    extraPhones: site.extraPhones.map((item) => ({ ...item })),
    address: { ...site.address },
    ratingValue: site.ratingValue,
    reviewCount: site.reviewCount,
    googleRating: site.googleRating,
    googleReviewCount: site.googleReviewCount,
    googleReviewsUrl: site.googleReviewsUrl,
    parentCompany: site.parentCompany,
    social: { ...site.social },
    promo: {
      eyebrow: "Rechargeable",
      title: "All-day rechargeable hearing aids — at honest listed prices",
      body: "Premium RIC and BTE models from Signia, Phonak, Widex and Oticon. Try them, then pay at the fitting.",
      href: "/hearing-aids/features/rechargeable",
      cta: "Browse rechargeable models",
      image: "/images/hero/slide-01.webp",
    },
    footer: {
      eyebrow: "Ready when you are",
      title: "Book a free 30-minute hearing test",
      titleAccent: " — clinic or home.",
      body: "Rohini, Green Park, Indirapuram and Sanjay Nagar. No obligation to buy.",
      blurb: site.tagline,
    },
  };
}

export function defaultClinics(): CmsClinic[] {
  return clinics.map((clinic, index) => ({
    ...clinic,
    published: true,
    sortOrder: index + 1,
  }));
}

export function defaultServices(): CmsService[] {
  return clinicalServices.map((service, index) => ({
    ...service,
    detailImage: `/images/services/${service.slug}-detail.jpg`,
    published: true,
    sortOrder: index + 1,
  }));
}

export function defaultTeam(): CmsTeamMember[] {
  return team.map((member, index) => ({
    ...member,
    published: true,
    sortOrder: index + 1,
  }));
}

export function defaultHeroSlides(): HeroSlide[] {
  return heroSlides.map((slide, index) => ({
    src: slide.src,
    alt: slide.alt,
    sortOrder: index + 1,
    published: true,
  }));
}

export function defaultFaqs(): CmsFaq[] {
  return faqs.map((item, index) => ({
    ...item,
    page: "all",
    sortOrder: index + 1,
    published: true,
  }));
}

export function defaultTestimonials(): CmsTestimonial[] {
  return [
    {
      name: "Anita Sharma",
      city: "Rohini, Delhi",
      quote: "Restaurant noise used to shut me out. Now I follow family conversations without asking people to repeat.",
      product: "",
      photo: "",
      photoAlt: "",
      layout: "teal",
      sortOrder: 1,
      published: true,
    },
    {
      name: "Ramesh Kumar",
      city: "Green Park patient",
      quote:
        "First time I heard birds in my garden after 8 years. The home fitting was so gentle, and every price was explained before we started. No pressure — just honest care.",
      product: "Verified Google review",
      photo: "",
      photoAlt: "",
      layout: "quote",
      sortOrder: 2,
      published: true,
    },
    {
      name: "Meera D.",
      city: "Jaipur",
      quote: "My father finally enjoys phone calls again. The Bluetooth pairing took two minutes.",
      product: "Verified Patient",
      photo: "/images/clinic/clinic-03.svg",
      photoAlt: "Patient consultation at Hearing Hope",
      layout: "photo",
      sortOrder: 3,
      published: true,
    },
    {
      name: "Suresh Patel",
      city: "Pune",
      quote: "Charging case is so simple. One charge lasts my whole workday plus evening TV.",
      product: "Tech spotlight",
      photo: "/images/products/ric.svg",
      photoAlt: "Hearing aid close-up",
      layout: "spotlight",
      sortOrder: 4,
      published: true,
    },
    {
      name: "Joseph M.",
      city: "Kochi",
      quote: "The audiologist explained every price clearly. No pressure, just a proper test and a trial.",
      product: "",
      photo: "",
      photoAlt: "",
      layout: "orange",
      sortOrder: 5,
      published: true,
    },
    {
      name: "Farah Qureshi",
      city: "",
      quote: "I wanted something invisible. The CIC is comfortable all day and nobody notices it.",
      product: "",
      photo: "",
      photoAlt: "",
      layout: "simple",
      sortOrder: 6,
      published: true,
    },
    {
      name: "Rajesh T.",
      city: "Business owner",
      quote: "Walked into the Indirapuram clinic unsure. Walked out with a plan I could actually afford.",
      product: "",
      photo: "",
      photoAlt: "",
      layout: "peach",
      sortOrder: 7,
      published: true,
    },
  ];
}

export function defaultAwards(): CmsAward[] {
  return awards.map((item, index) => ({
    src: item.src,
    alt: item.alt,
    label: item.label,
    sortOrder: index + 1,
    published: true,
  }));
}

export function defaultHospitals(): CmsHospital[] {
  return hospitalPartners.map((item, index) => ({
    name: item.name,
    location: item.location,
    logo: item.logo,
    url: item.url ?? "",
    focus: item.focus,
    sortOrder: index + 1,
    published: true,
  }));
}

export function defaultStylePages(): CmsStylePage[] {
  return hearingAidTypes.map((type) => {
    const page = hearingAidTypePages[type.id];
    const visual = hearingAidTypeVisuals[type.id];
    return {
      ...type,
      ...page,
      image: visual.image,
      wash: visual.wash,
    };
  });
}

export function defaultFeaturePages(): CmsFeaturePage[] {
  return hearingAidFeatures.map((feature) => {
    const page = hearingAidFeaturePages[feature.id];
    return {
      id: feature.id,
      label: feature.label,
      navLabel: feature.navLabel,
      tagline: feature.tagline,
      body: feature.body,
      who: feature.who,
      icon: feature.icon,
      wash: feature.wash,
      headline: page.headline,
      facts: page.facts,
      points: page.points,
      highlights: page.highlights,
      heroImage: page.heroImage,
    };
  });
}

export function defaultBrandProfiles(): CmsBrandProfile[] {
  return brandProfiles.map((brand, index) => ({
    ...brand,
    sortOrder: index + 1,
  }));
}

export function defaultPages() {
  return SITE_PAGE_IDS.map((id) => defaultPage(id));
}

export function settingsPayload(settings: SiteSettings) {
  return {
    id: "default",
    name: settings.name,
    tagline: settings.tagline,
    description: settings.description,
    url: settings.url,
    phone_display: settings.phoneDisplay,
    phone_tel: settings.phoneTel,
    whatsapp_number: settings.whatsappNumber,
    email: settings.email,
    extra_phones: settings.extraPhones,
    address: settings.address,
    rating_value: settings.ratingValue,
    review_count: settings.reviewCount,
    google_rating: settings.googleRating,
    google_review_count: settings.googleReviewCount,
    google_reviews_url: settings.googleReviewsUrl,
    parent_company: settings.parentCompany,
    social: settings.social,
    promo: settings.promo,
    footer: settings.footer,
  };
}

export function mapSettingsRow(row: Record<string, unknown> | null | undefined): SiteSettings {
  const base = defaultSettings();
  if (!row) return base;
  return {
    name: String(row.name ?? base.name),
    tagline: String(row.tagline ?? base.tagline),
    description: String(row.description ?? base.description),
    url: String(row.url ?? base.url),
    phoneDisplay: String(row.phone_display ?? base.phoneDisplay),
    phoneTel: String(row.phone_tel ?? base.phoneTel),
    whatsappNumber: String(row.whatsapp_number ?? base.whatsappNumber),
    email: String(row.email ?? base.email),
    extraPhones: Array.isArray(row.extra_phones) ? (row.extra_phones as SiteSettings["extraPhones"]) : base.extraPhones,
    address: row.address && typeof row.address === "object" ? { ...base.address, ...(row.address as object) } : base.address,
    ratingValue: String(row.rating_value ?? base.ratingValue),
    reviewCount: String(row.review_count ?? base.reviewCount),
    googleRating: String(row.google_rating ?? base.googleRating),
    googleReviewCount: String(row.google_review_count ?? base.googleReviewCount),
    googleReviewsUrl: String(row.google_reviews_url ?? base.googleReviewsUrl),
    parentCompany: String(row.parent_company ?? base.parentCompany),
    social: row.social && typeof row.social === "object" ? { ...base.social, ...(row.social as object) } : base.social,
    promo: row.promo && typeof row.promo === "object" ? { ...base.promo, ...(row.promo as object) } : base.promo,
    footer: row.footer && typeof row.footer === "object" ? { ...base.footer, ...(row.footer as object) } : base.footer,
  };
}
