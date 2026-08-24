import type { HearingAidFeatureId, HearingAidStyle, Product } from "@/types";
import { hearingAidTypes } from "@/data/content";

export type { HearingAidFeatureId };

export type HearingAidsQuery = {
  brand?: string;
  type?: string;
  feature?: string;
};

export const hearingAidTypeVisuals: Record<
  HearingAidStyle,
  { image: string; wash: string }
> = {
  RIC: { image: "/images/products/ric.svg", wash: "bg-[#FFF4ED]" },
  BTE: { image: "/images/products/bte.svg", wash: "bg-[#E7F7F3]" },
  ITC: { image: "/images/products/itc.svg", wash: "bg-brand-surface" },
  CIC: { image: "/images/products/cic.svg", wash: "bg-[#FFF4ED]" },
  IIC: { image: "/images/products/iic.svg", wash: "bg-[#E7F7F3]" },
  ITE: { image: "/images/products/ite.svg", wash: "bg-brand-surface" },
};

export const hearingAidFeatures: {
  id: HearingAidFeatureId;
  label: string;
  navLabel: string;
  tagline: string;
  body: string;
  who: string;
  icon: "battery" | "bluetooth" | "noise" | "invisible" | "custom" | "power";
  wash: string;
}[] = [
  {
    id: "rechargeable",
    label: "Rechargeable",
    navLabel: "Rechargeable",
    tagline: "Dock overnight. Wear all day.",
    body: "Lithium-ion hearing aids charge in a case like a phone. We check real wearing hours against your day — not a brochure claim — so you are not left short at 6 pm.",
    who: "Anyone who does not want to swap tiny batteries every few days.",
    icon: "battery",
    wash: "bg-[#FFF4ED]",
  },
  {
    id: "bluetooth",
    label: "Bluetooth streaming",
    navLabel: "Bluetooth",
    tagline: "Calls and media in both ears.",
    body: "Stream phone calls, maps and TV audio straight into the hearing aids. We pair the phone in clinic so you leave knowing it actually works with your handset.",
    who: "People on daily calls, video chats, or TV at a volume that bothers the family.",
    icon: "bluetooth",
    wash: "bg-[#E7F7F3]",
  },
  {
    id: "noise-cancellation",
    label: "Noise cancellation",
    navLabel: "Noise cancellation",
    tagline: "Speech in restaurants, traffic, offices.",
    body: "Modern chips lift speech while the room stays noisy — not a mute button on the world. The right setting depends on your audiogram and how aggressive you like the sound.",
    who: "Anyone whose main complaint is ‘I hear, but I cannot follow conversation in noise.’",
    icon: "noise",
    wash: "bg-brand-surface",
  },
  {
    id: "invisible",
    label: "Invisible in the canal",
    navLabel: "Invisible",
    tagline: "Deep custom shells that stay out of sight.",
    body: "CIC and IIC hearing aids sit in the canal so there is nothing over the ear. They only work if your loss and ear anatomy allow it — we will say no if a RIC would hear better.",
    who: "People who will not wear anything visible, and whose audiogram can live in a tiny shell.",
    icon: "invisible",
    wash: "bg-[#FFF4ED]",
  },
  {
    id: "custom-fit",
    label: "Custom fit",
    navLabel: "Custom fit",
    tagline: "Made from your ear impression.",
    body: "ITC, CIC, IIC and custom ITE shells are moulded to your ear. Fit, venting and colour are part of the product — not an accessory you pick later.",
    who: "Glasses, masks, helmets, or anyone who wants the aid to vanish into the ear.",
    icon: "custom",
    wash: "bg-[#E7F7F3]",
  },
  {
    id: "power",
    label: "High power",
    navLabel: "High power",
    tagline: "Headroom for severe-to-profound loss.",
    body: "Power BTEs give the gain a slim RIC cannot. We still program to your audiogram — louder is not better if it is the wrong curve or a whistling mould.",
    who: "Severe or profound loss, or anyone a standard RIC cannot reach cleanly.",
    icon: "power",
    wash: "bg-brand-surface",
  },
];

export type FeatureIconName = (typeof hearingAidFeatures)[number]["icon"];

export function getHearingAidFeature(id?: string) {
  if (!id) return undefined;
  return hearingAidFeatures.find((feature) => feature.id === id);
}

export function productHasFeature(product: Product, feature: HearingAidFeatureId) {
  if (product.featureIds?.length) return product.featureIds.includes(feature);
  switch (feature) {
    case "rechargeable":
      return product.rechargeable;
    case "bluetooth":
      return product.bluetooth;
    case "noise-cancellation":
      return product.type !== "CIC" && product.type !== "IIC";
    case "invisible":
      return product.type === "CIC" || product.type === "IIC";
    case "custom-fit":
      return product.type === "ITC" || product.type === "CIC" || product.type === "IIC" || product.type === "ITE";
    case "power":
      return /na[ií]da/i.test(`${product.slug} ${product.name}`)
        || /\bpower bte\b/i.test(product.badge)
        || /high-power|severe-to-profound/i.test(`${product.badge} ${product.feature} ${product.overview}`);
    default:
      return false;
  }
}

export function filterHearingAids(items: Product[], query: HearingAidsQuery) {
  return items.filter((product) => {
    if (query.brand && product.brand.toLowerCase() !== query.brand.toLowerCase()) return false;
    if (query.type && product.type !== query.type) return false;
    const feature = getHearingAidFeature(query.feature);
    if (feature && !productHasFeature(product, feature.id)) return false;
    return true;
  });
}

export function getHearingAidTypeBySlug(slug: string) {
  return hearingAidTypes.find((type) => type.id.toLowerCase() === slug.toLowerCase());
}

export function typeHref(style: HearingAidStyle | string) {
  return `/hearing-aids/types/${style.toLowerCase()}`;
}

export function featureHref(id: HearingAidFeatureId | string) {
  return `/hearing-aids/features/${id}`;
}

export function productsByType(items: Product[], style: HearingAidStyle) {
  return items.filter((product) => product.type === style);
}

export function productsByFeature(items: Product[], id: HearingAidFeatureId) {
  return items.filter((product) => productHasFeature(product, id));
}

export function hearingAidsHref(query: HearingAidsQuery = {}, hash = "") {
  if (query.feature && !query.brand && !query.type) return featureHref(query.feature);
  if (query.type && !query.brand && !query.feature) return typeHref(query.type);
  const path = "/hearing-aids";
  return hash ? `${path}#${hash}` : path;
}

export function hearingAidsCatalogHeading(query: HearingAidsQuery) {
  const feature = getHearingAidFeature(query.feature);
  const type = hearingAidTypes.find((item) => item.id === query.type);
  const parts = [query.brand, type?.shortName ?? query.type, feature?.label].filter(Boolean);
  if (parts.length === 0) return "All hearing aids we trial";
  return `${parts.join(" · ")} hearing aids`;
}

export function featureProductCount(items: Product[], id: HearingAidFeatureId) {
  return productsByFeature(items, id).length;
}

export function typeProductCount(items: Product[], id: HearingAidStyle) {
  return productsByType(items, id).length;
}
