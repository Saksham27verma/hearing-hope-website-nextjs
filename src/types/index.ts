export type Brand =
  | "Signia"
  | "Phonak"
  | "Widex"
  | "Oticon"
  | "Starkey"
  | "ReSound";

export type HearingAidStyle =
  | "RIC"
  | "BTE"
  | "ITC"
  | "CIC"
  | "IIC"
  | "ITE";

export type HearingAidFeatureId =
  | "rechargeable"
  | "bluetooth"
  | "noise-cancellation"
  | "invisible"
  | "custom-fit"
  | "power";

export interface ProductColor {
  id: string;
  name: string;
  hex: string | null;
  isDefault: boolean;
  inStock: boolean;
  sortOrder: number;
  images: string[];
}

export interface Product {
  id: string;
  slug: string;
  brand: string;
  brandSlug: string;
  brandLogo: string;
  type: HearingAidStyle;
  name: string;
  badge: string;
  rating: number;
  reviewCount: number;
  feature: string;
  overview: string;
  features: { title: string; body: string }[];
  featureIds: HearingAidFeatureId[];
  mrp: number;
  inStock: boolean;
  rechargeable: boolean;
  bluetooth: boolean;
  image: string;
  images: string[];
  colors: ProductColor[];
  published?: boolean;
}

export interface CatalogBrand {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  sortOrder: number;
}

export interface HearingAidType {
  id: HearingAidStyle;
  name: string;
  shortName: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  quote: string;
  product: string;
  accent: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TrustStat {
  value: string;
  label: string;
}

export interface ClinicLocation {
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
  images: string[];
  comingSoon?: boolean;
}

export interface BlogAuthor {
  name: string;
  role: string;
  image?: string;
}

export interface BlogSection {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: boolean;
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  image: string;
  imageAlt: string;
  author: BlogAuthor;
  sections: BlogSection[];
  faqs: BlogFaq[];
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
  canonicalPath: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export type BlogPostDraft = Omit<
  BlogPost,
  | "id"
  | "published"
  | "faqs"
  | "metaTitle"
  | "metaDescription"
  | "focusKeyword"
  | "keywords"
  | "canonicalPath"
  | "robotsIndex"
  | "robotsFollow"
  | "ogTitle"
  | "ogDescription"
  | "ogImage"
> &
  Partial<BlogPost>;

export type ClinicalServiceIcon =
  | "activity"
  | "ear"
  | "brain"
  | "headphones"
  | "audio-lines"
  | "baby"
  | "radio"
  | "waves"
  | "audio-waveform"
  | "speech";

export interface ClinicalService {
  slug: string;
  shortName: string;
  title: string;
  category: string;
  duration: string;
  excerpt: string;
  image: string;
  icon: ClinicalServiceIcon;
  accent: string;
  who: string;
  what: string;
  expect: string[];
}

export interface TeamMember {
  slug: string;
  honorific: string;
  name: string;
  role: string;
  credentials?: string;
  bio: string;
  image: string;
  featured?: boolean;
}

export interface BrandTechnology {
  title: string;
  body: string;
}

export interface BrandProfile {
  slug: string;
  name: Brand;
  logo: string;
  tagline: string;
  country: string;
  founded: string;
  headquarters: string;
  parent: string;
  intro: string;
  story: string[];
  technologies: BrandTechnology[];
  highlights: string[];
}
