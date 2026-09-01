import { heroServices, heroStats, trustStats } from "@/data/content";
import { featureHref } from "@/data/hearing-aids";
import { site } from "@/lib/site";
import type { SitePageDoc, SitePageFields, SitePageId } from "@/lib/site-cms/types";

export const SITE_PAGE_IDS: SitePageId[] = [
  "home",
  "about",
  "clinics",
  "services",
  "hearing-aids",
  "pricing",
  "blog",
];

export const defaultPageFields: SitePageFields = {
  home: {
    heroEyebrow: "Diagnostics · Devices · Therapy",
    heroTitle: "India's most trusted name in",
    heroHighlight: "Hearing Care",
    heroBody:
      "From a first hearing test to premium aids, cochlear-implant support and speech therapy — one audiologist-led team for 2 Lakh+ families.",
    ratingLine: "Google rated · 15+ years of clinical care",
    servicesHeading: "Our services",
    heroServices: heroServices.map((item) => ({ ...item })),
    heroStats: heroStats.map((item) => ({ ...item })),
    whyChooseEyebrow: "The Hearing Hope difference",
    whyChooseTitle: "Why Choose Hearing Hope",
    whyChooseBody:
      "Same premium brands — with a real audiologist, a free trial, and after-care that does not stop at the invoice.",
    whyChooseHopeLabel: "Hearing Hope",
    whyChooseOtherLabel: "Typical clinics",
    whyChooseRows: [
      { feature: "Audiologist-led diagnostic test", hope: true, clinics: false },
      { feature: "Complimentary first hearing check", hope: true, clinics: false },
      { feature: "Guidance from senior audiologists", hope: true, clinics: false },
      { feature: "Free hearing-aid trials (clinic or home)", hope: true, clinics: false },
      { feature: "Complimentary fine-tuning after the fit", hope: true, clinics: false },
      { feature: "Extended warranty support", hope: true, clinics: false },
      { feature: "Top global brands under one roof", hope: true, clinics: false },
    ],
    trustStats: trustStats.map((item) => ({ ...item })),
    reviewsEyebrow: "Testimonials",
    reviewsTitle: "What Our Clients Say",
    faqEyebrow: "FAQs",
    faqTitle: "Questions families ask before a hearing test",
  },
  about: {
    eyebrow: "About Hearing Hope",
    title: "We exist so India can",
    highlight: "hear clearly",
    titleAfter: "again.",
    body: "A family-led audiology network in Delhi NCR — Signia certified, hospital-tied, and stubborn about honest prices. From a first PTA to a cochlear-implant conversation, the same team stays with you.",
    ctaPrimary: "Meet the team",
    ctaSecondary: "Book an appointment",
    heroImages: [
      { src: "/images/clinic/clinic-03.svg", alt: "Hearing Hope consultation", label: "Our clinics" },
      { src: "/images/clinic/clinic-01.svg", alt: "Audiology booth", label: "Diagnostics" },
      { src: "/images/clinic/clinic-07.svg", alt: "Family at Hearing Hope", label: "Families we serve" },
    ],
    storyEyebrow: "Our story",
    storyTitle: "Built as a clinic. Run like a family.",
    storyBody1:
      "Hearing Hope began so people would not have to choose between clinical quality and being treated kindly. We are a unit of Hope Digital Innovations Pvt Ltd — with open centres in Rohini, Green Park, Indirapuram and Sanjay Nagar, and desks inside partner hospitals.",
    storyBody2:
      "Today we fit premium global brands, run a full diagnostic battery, and still explain every audiogram in language you can take home.",
    quote: "It is my dream to gift everyone the hope of hearing.",
    quoteBy: "Mrs. Neelam Verma · Director",
    principles: [
      {
        index: "01",
        title: "Patient-first care",
        body: "Your comfort sets the pace. We listen before we recommend, and we never rush a family into a device.",
      },
      {
        index: "02",
        title: "Honest practice",
        body: "Transparent MRP, plain-language reports and the same advice we would give our own parents.",
      },
      {
        index: "03",
        title: "Hospital-grade tools",
        body: "PTA, impedance, OAE, BERA and ASSR in quiet rooms — Signia-certified centres with partner hospital desks.",
      },
      {
        index: "04",
        title: "Care that continues",
        body: "Fine-tuning, speech therapy and after-care so hearing stays clear long after the first appointment.",
      },
    ],
    whyUs: [
      { title: "Signia certified centres", body: "Trusted protocols, verified fittings." },
      { title: "Professional audiologists", body: "Diagnostics led by clinicians, not a sales floor." },
      { title: "World-class equipment", body: "Full test battery for adults and children." },
      { title: "Home visits too", body: "The same calm evaluation if travel is hard." },
    ],
    teamEyebrow: "Our people",
    teamTitle: "Meet the team",
    teamBody:
      "Directors, audiologists and counsellors who know our patients by name. Drop portraits into the photo frames whenever you are ready.",
    ctaTitle: "Silence is overrated.",
    ctaBody:
      "Walk into a Hearing Hope clinic — or book a home test — and leave with a clear next step. No pressure. Just better hearing.",
    ctaBullets: ["Free first evaluation", "Same-day explanation", "After-care that actually follows up"],
    ctaButton: "Book an appointment",
  },
  clinics: {
    eyebrow: "Our clinics",
    title: "Four open centres in Delhi NCR — and more on the way",
    body: "Walk into Rohini, Green Park, Indirapuram or Sanjay Nagar for a hearing test, a hearing-aid trial or speech therapy. Use the locator below for directions, or book a home visit if you would rather we come to you.",
    perks: [
      {
        title: "Audiologist-led care",
        body: "Every walk-in is a diagnostic appointment — not a sales counter. You leave with a clear report and a plan.",
      },
      {
        title: "Home hearing tests",
        body: "If travel is hard, an audiologist can visit you. Same tests, same honest advice, no obligation to buy.",
      },
      {
        title: "Fittings that come to you",
        body: "After you choose a model, remaining payment and the fit happen at the appointment — clinic or home.",
      },
      {
        title: "Mon–Sat, 10 AM–7 PM",
        body: "Open centres keep regular hours. Call ahead for BERA, ASSR or paediatric slots that need extra time.",
      },
    ],
  },
  services: {
    eyebrow: "Clinical services",
    title: "Audiology that is thorough, calm and easy to understand",
    body: "Hearing Hope brings diagnostic tests, hearing-aid fitting, cochlear-implant support and speech therapy together in one Delhi NCR network. Every service is led by an audiologist — in clinic or at home — with a clear report and a plan you can act on.",
    heroMain: "/images/services/hero-main.jpg",
    heroSide1: "/images/services/hero-side-1.jpg",
    heroSide2: "/images/services/hero-side-2.jpg",
    visitImage: "/images/services/visit.jpg",
    pillars: [
      {
        title: "Diagnostics",
        body: "PTA, impedance, OAE, BERA, ASSR and paediatric sound-field tests so we know exactly how you hear — before recommending a device.",
      },
      {
        title: "Devices & implants",
        body: "Hearing-aid evaluation, programming and cochlear-implant counselling with hospital partners when an implant is the right path.",
      },
      {
        title: "Therapy & after-care",
        body: "Aided audiometry to verify your fit, plus speech and auditory-verbal therapy so listening skills keep growing after the appointment.",
      },
    ],
    steps: [
      {
        title: "Share your concern",
        body: "Tell us about muffled speech, a child’s delayed response, tinnitus or a follow-up after surgery. We suggest the right test, not a one-size battery.",
      },
      {
        title: "Test with an audiologist",
        body: "Sessions run in a quiet booth or play-based room. Results are explained in plain language, with a written report when you need one for school or a doctor.",
      },
      {
        title: "A clear next step",
        body: "That may be medical referral, a hearing-aid trial, implant counselling or speech therapy — never pressure to buy on the same day.",
      },
    ],
  },
  "hearing-aids": {
    eyebrow: "Hearing aids",
    title: "Hearing aids fitted to your audiogram",
    body: "Compare Signia, Phonak, Widex, Oticon, ReSound and Starkey. Open a brand, type or feature page — then we match the model to your audiogram, not a brochure.",
    heroImage: "/images/hero/slide-01.webp",
    steps: [
      {
        title: "Your audiogram first",
        body: "Pure-tone thresholds, speech scores and ear health. This is the prescription. No hearing aid is ‘best’ until we have it.",
      },
      {
        title: "How you actually live",
        body: "Restaurants, traffic, calls, discretion, glasses, charging habits. Two people with the same graph can need different shells.",
      },
      {
        title: "Trial the shortlist",
        body: "We put two or three hearing aids on your ears — not a catalogue in your hands. You hear the difference in the room, then at home if you want.",
      },
      {
        title: "Programmed to you",
        body: "Real-ear measures lock the sound to your audiogram. Fine-tuning after a week is included. The chip is only as good as the fit.",
      },
    ],
    paths: [
      {
        title: "Conversations in noise",
        body: "A rechargeable RIC with strong speech-in-noise is usually the first trial — Signia IX, Phonak Lumity, Oticon Intent or similar — after we see your audiogram.",
        href: featureHref("noise-cancellation"),
        image: "/images/products/ric.svg",
        wash: "bg-[#FFF4ED]",
      },
      {
        title: "Nothing visible",
        body: "CIC and IIC only when anatomy and thresholds allow. We will say no if a discreet RIC would hear better.",
        href: featureHref("invisible"),
        image: "/images/products/iic.svg",
        wash: "bg-[#E7F7F3]",
      },
      {
        title: "Severe-to-profound loss",
        body: "Power BTEs and moulds, verified with real-ear — not a volume wheel turned to max.",
        href: featureHref("power"),
        image: "/images/products/bte.svg",
        wash: "bg-brand-surface",
      },
    ],
  },
  pricing: {
    title: "Hearing aid price list",
    body: "MRPs are shown below. Final quotes depend on your audiogram, warranty pack and accessories. Ask for a best-price callback — no obligation.",
    catalogHeading: "Hearing aid MRP list",
  },
  blog: {
    eyebrow: "Blog",
    title: "Hearing care, explained simply",
    body: "Practical articles from Hearing Hope audiologists on tests, device types, prices in India, and supporting family members with hearing loss.",
  },
};

export const defaultPageMeta: Record<SitePageId, { metaTitle: string; metaDescription: string }> = {
  home: { metaTitle: "", metaDescription: site.description },
  about: {
    metaTitle: "About Us",
    metaDescription:
      "Hearing Hope is India's trusted hearing care brand — 15+ years, expert audiologists, and a family-led team across Delhi NCR.",
  },
  clinics: {
    metaTitle: "Our Clinics",
    metaDescription:
      "Visit Hearing Hope in Rohini, Green Park, Indirapuram and Sanjay Nagar — or book a home hearing test across Delhi NCR. New clinics coming soon in Gurugram and Noida.",
  },
  services: {
    metaTitle: "Hearing Care Services",
    metaDescription:
      "PTA, impedance, BERA, OAE, ASSR, free-field and aided audiometry, cochlear implant support, hearing aid fitting and speech therapy at Hearing Hope.",
  },
  "hearing-aids": {
    metaTitle: "Hearing aids fitted to your audiogram",
    metaDescription:
      "Compare Signia, Phonak, Widex, Oticon, ReSound and Starkey hearing aids at Hearing Hope. Open a brand, type or feature page — then we match the model to your audiogram, not a brochure.",
  },
  pricing: {
    metaTitle: "Hearing Aid Price List",
    metaDescription: "Transparent hearing aid prices in India. Compare MRP for Signia, Phonak, Widex, Oticon and more.",
  },
  blog: {
    metaTitle: "Hearing care blog",
    metaDescription: "Practical articles from Hearing Hope audiologists on tests, device types, prices in India, and supporting family members with hearing loss.",
  },
};

export function defaultPage<K extends SitePageId>(id: K): SitePageDoc<K> {
  return {
    id,
    metaTitle: defaultPageMeta[id].metaTitle,
    metaDescription: defaultPageMeta[id].metaDescription,
    fields: defaultPageFields[id],
  };
}

export function mergePage<K extends SitePageId>(id: K, row?: { meta_title?: string; meta_description?: string; fields?: unknown } | null): SitePageDoc<K> {
  const base = defaultPage(id);
  if (!row) return base;
  return {
    id,
    metaTitle: row.meta_title?.trim() || base.metaTitle,
    metaDescription: row.meta_description?.trim() || base.metaDescription,
    fields: { ...base.fields, ...(typeof row.fields === "object" && row.fields ? row.fields : {}) } as SitePageFields[K],
  };
}
