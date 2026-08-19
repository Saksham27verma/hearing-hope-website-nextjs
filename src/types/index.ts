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

export interface Product {
  slug: string;
  brand: Brand;
  type: HearingAidStyle;
  name: string;
  badge: string;
  rating: number;
  reviewCount: number;
  feature: string;
  mrp: number;
  offerPrice: number;
  inStock: boolean;
  rechargeable: boolean;
  bluetooth: boolean;
  image: string;
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
  certification: string;
  address: string;
  phoneDisplay: string;
  phoneTel: string;
  hours: string;
  images: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  content: string[];
}
