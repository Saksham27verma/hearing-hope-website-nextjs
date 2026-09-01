import type {
  BrandProfile,
  BrandTechnology,
  ClinicalService,
  ClinicalServiceIcon,
  ClinicLocation,
  FaqItem,
  HearingAidFeatureId,
  HearingAidStyle,
  HearingAidType,
  TeamMember,
  TrustStat,
} from "@/types";
import type { CollectionFact, CollectionPoint } from "@/data/hearing-aid-collections";
import type { FeatureIconName } from "@/data/hearing-aids";

export const SITE_CMS_TAG = "site-cms";

export type SitePageId = "home" | "about" | "clinics" | "services" | "hearing-aids" | "pricing" | "blog";

export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsappNumber: string;
  email: string;
  extraPhones: { display: string; tel: string }[];
  address: {
    street: string;
    locality: string;
    region: string;
    postalCode: string;
    country: string;
  };
  ratingValue: string;
  reviewCount: string;
  googleRating: string;
  googleReviewCount: string;
  googleReviewsUrl: string;
  parentCompany: string;
  social: { facebook: string; instagram: string; youtube: string };
  promo: {
    eyebrow: string;
    title: string;
    body: string;
    href: string;
    cta: string;
    image: string;
  };
  footer: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    body: string;
    blurb: string;
  };
};

export type HeroSlide = { id?: string; src: string; alt: string; storagePath?: string; sortOrder: number; published: boolean };
export type CmsFaq = FaqItem & { id?: string; page: "all" | "home" | "hearing-aids"; sortOrder: number; published: boolean };
export type CmsTestimonial = {
  id?: string;
  name: string;
  city: string;
  quote: string;
  product: string;
  photo: string;
  photoAlt: string;
  layout: string;
  sortOrder: number;
  published: boolean;
};
export type CmsAward = { id?: string; src: string; alt: string; label: string; sortOrder: number; published: boolean };
export type CmsHospital = {
  id?: string;
  name: string;
  location: string;
  logo: string;
  url: string;
  focus: string;
  sortOrder: number;
  published: boolean;
};
export type CmsClinic = ClinicLocation & { id?: string; published: boolean; sortOrder: number };
export type CmsService = ClinicalService & { id?: string; detailImage: string; published: boolean; sortOrder: number };
export type CmsTeamMember = TeamMember & { id?: string; published: boolean; sortOrder: number };
export type CmsStylePage = HearingAidType & {
  headline: string;
  tagline: string;
  intro: string;
  facts: CollectionFact[];
  points: CollectionPoint[];
  highlights: string[];
  image: string;
  wash: string;
};
export type CmsFeaturePage = {
  id: HearingAidFeatureId;
  label: string;
  navLabel: string;
  tagline: string;
  body: string;
  who: string;
  icon: FeatureIconName;
  wash: string;
  headline: string;
  facts: CollectionFact[];
  points: CollectionPoint[];
  highlights: string[];
  heroImage: string;
};
export type CmsBrandProfile = BrandProfile & { id?: string; sortOrder: number };

export type HomeFields = {
  heroEyebrow: string;
  heroTitle: string;
  heroHighlight: string;
  heroBody: string;
  ratingLine: string;
  servicesHeading: string;
  heroServices: { slug: string; label: string; hint: string }[];
  heroStats: { value: string; label: string }[];
  whyChooseEyebrow: string;
  whyChooseTitle: string;
  whyChooseBody: string;
  whyChooseHopeLabel: string;
  whyChooseOtherLabel: string;
  whyChooseRows: { feature: string; hope: boolean; clinics: boolean }[];
  trustStats: TrustStat[];
  reviewsEyebrow: string;
  reviewsTitle: string;
  faqEyebrow: string;
  faqTitle: string;
};

export type AboutFields = {
  eyebrow: string;
  title: string;
  highlight: string;
  titleAfter: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
  heroImages: { src: string; alt: string; label: string }[];
  storyEyebrow: string;
  storyTitle: string;
  storyBody1: string;
  storyBody2: string;
  quote: string;
  quoteBy: string;
  principles: { index: string; title: string; body: string }[];
  whyUs: { title: string; body: string }[];
  teamEyebrow: string;
  teamTitle: string;
  teamBody: string;
  ctaTitle: string;
  ctaBody: string;
  ctaBullets: string[];
  ctaButton: string;
};

export type ClinicsPageFields = {
  eyebrow: string;
  title: string;
  body: string;
  perks: { title: string; body: string }[];
};

export type ServicesPageFields = {
  eyebrow: string;
  title: string;
  body: string;
  heroMain: string;
  heroSide1: string;
  heroSide2: string;
  visitImage: string;
  pillars: { title: string; body: string }[];
  steps: { title: string; body: string }[];
};

export type HearingAidsPageFields = {
  eyebrow: string;
  title: string;
  body: string;
  heroImage: string;
  steps: { title: string; body: string }[];
  paths: { title: string; body: string; href: string; image: string; wash: string }[];
};

export type PricingPageFields = {
  title: string;
  body: string;
  catalogHeading: string;
};

export type BlogPageFields = {
  eyebrow: string;
  title: string;
  body: string;
};

export type SitePageFields = {
  home: HomeFields;
  about: AboutFields;
  clinics: ClinicsPageFields;
  services: ServicesPageFields;
  "hearing-aids": HearingAidsPageFields;
  pricing: PricingPageFields;
  blog: BlogPageFields;
};

export type SitePageDoc<K extends SitePageId = SitePageId> = {
  id: K;
  metaTitle: string;
  metaDescription: string;
  fields: SitePageFields[K];
};

export type SiteChrome = {
  settings: SiteSettings;
  types: CmsStylePage[];
  features: CmsFeaturePage[];
  brands: BrandProfile[];
  services: ClinicalService[];
  clinics: ClinicLocation[];
  slides: HeroSlide[];
};
