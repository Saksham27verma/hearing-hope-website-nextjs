import type { FaqItem, HearingAidType, Testimonial, TrustStat } from "@/types";

export const brands = [
  "Signia",
  "Phonak",
  "Widex",
  "Oticon",
  "ReSound",
  "Starkey",
] as const;

export const hearingAidTypes: HearingAidType[] = [
  {
    id: "RIC",
    name: "Receiver In Canal",
    shortName: "RIC",
    description: "Discreet behind-the-ear power with a tiny speaker in the canal.",
  },
  {
    id: "BTE",
    name: "Behind The Ear",
    shortName: "BTE",
    description: "Reliable, powerful option for mild to profound hearing loss.",
  },
  {
    id: "ITC",
    name: "Inside The Canal",
    shortName: "ITC",
    description: "Custom in-canal fit that balances discretion and controls.",
  },
  {
    id: "CIC",
    name: "Completely In Canal",
    shortName: "CIC",
    description: "Sits deeper in the ear canal for a nearly hidden look.",
  },
  {
    id: "IIC",
    name: "Invisible In Canal",
    shortName: "IIC",
    description: "Deepest custom fit, designed to stay out of sight.",
  },
  {
    id: "ITE",
    name: "Rechargeable / Custom ITE",
    shortName: "ITE",
    description: "Custom in-the-ear shells with all-day rechargeable convenience.",
  },
];

export const trustStats: TrustStat[] = [
  { value: "2 Lakh+", label: "Satisfied Customers" },
  { value: "100+", label: "Pan-India Cities" },
  { value: "15+", label: "Years of Experience" },
  { value: "100+", label: "Hearing Aid Models" },
  { value: "100+", label: "Expert Audiologists" },
  { value: "4 Years", label: "Extended Warranty" },
];

export const hospitalPartners = [
  {
    name: "Shree Aggarsain International Hospital",
    location: "Sector 22, Rohini, Delhi",
    logo: "/images/hospitals/shree-aggarsain.png",
    url: "https://saih.in/",
    focus: "Multispeciality hospital partner",
  },
  {
    name: "Rajiv Gandhi Cancer Institute & Research Centre",
    location: "Rohini, New Delhi",
    logo: "/images/hospitals/rgcirc.png",
    url: "https://www.rgcirc.org/",
    focus: "Oncology & research partner",
  },
  {
    name: "Vardhman Hospital",
    location: "Sanjay Nagar, Ghaziabad",
    logo: "/images/hospitals/vardhman.png",
    url: null,
    focus: "In-hospital Hearing Hope centre",
  },
] as const;

export const heroStats = [
  { value: "2 Lakh+", label: "Happy Customers" },
  { value: "100+", label: "Pan-India Cities" },
  { value: "100+", label: "Audiologists" },
] as const;

export const heroServices = [
  { slug: "hearing-aids", label: "Hearing Aids", hint: "Trial & fitting" },
  { slug: "cochlear-implant", label: "Cochlear Implant", hint: "Candidacy & mapping" },
  { slug: "pta-test", label: "PTA", hint: "Pure tone test" },
  { slug: "oae-test", label: "OAE", hint: "Newborn screen" },
  { slug: "bera-test", label: "BERA", hint: "Brainstem test" },
  { slug: "speech-therapy", label: "Speech Therapy", hint: "Listen & speak" },
] as const;

export const trustBullets = [
  "Expert Audiologists",
  "Premium Brands",
  "Transparent Pricing",
  "Pan-India Network",
] as const;

export const faqs: FaqItem[] = [
  {
    question: "How much do hearing aids cost in India?",
    answer:
      "Hearing aids in India typically start around ₹25,000 for basic models and go up to ₹2.5 lakh+ for premium AI rechargeable devices. Hearing Hope shows transparent MRP on every model.",
  },
  {
    question: "Do you offer a free hearing test at home?",
    answer:
      "Yes. You can book a free home or clinic hearing test with no obligation. An audiologist completes the test and explains results in about 30 minutes.",
  },
  {
    question: "Which hearing aid brand is best?",
    answer:
      "The best brand depends on your audiogram, lifestyle and budget. We fit Signia, Phonak, Widex, Oticon, ReSound and Starkey, and recommend models only after a professional hearing evaluation.",
  },
  {
    question: "Can I try a hearing aid before buying?",
    answer:
      "Yes. Book a free home trial or clinic appointment. You can also reserve a device on cash-on-delivery or with a small advance token.",
  },
  {
    question: "Are rechargeable Bluetooth hearing aids available?",
    answer:
      "Most of our RIC and BTE range is rechargeable with Bluetooth streaming. Custom CIC and IIC models may use batteries depending on size.",
  },
  {
    question: "Where are your clinics located?",
    answer:
      "We have four open care centres: Rohini and Green Park in Delhi, and Indirapuram and Sanjay Nagar in Ghaziabad. New clinics are coming soon in Gurgaon, Noida, Dehradun and Chandigarh. We also run hearing desks at Shree Aggarsain International Hospital, RGCIRC, and Vardhman Hospital.",
  },
  {
    question: "Do you provide warranty and after-care?",
    answer:
      "Yes. Eligible models include up to 4 years of extended warranty, plus programming, follow-up visits and support from our audiologists after you purchase.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Ramesh K.",
    city: "Delhi",
    quote: "First time I heard birds in my garden after 8 years. The home fitting was so gentle.",
    product: "Signia Pure Charge&Go IX",
    accent: "#FF6503",
  },
  {
    id: "2",
    name: "Anita S.",
    city: "Mumbai",
    quote: "Restaurant noise used to shut me out. Now I follow family conversations without asking people to repeat.",
    product: "Phonak Audéo Lumity",
    accent: "#18AD8D",
  },
  {
    id: "3",
    name: "Joseph M.",
    city: "Kochi",
    quote: "The audiologist explained every price clearly. No pressure, just a proper test and a trial.",
    product: "Oticon Intent 1",
    accent: "#0F172A",
  },
  {
    id: "4",
    name: "Farah Q.",
    city: "Hyderabad",
    quote: "I wanted something invisible. The CIC is comfortable all day and nobody notices it.",
    product: "Widex Unique 440 CIC",
    accent: "#FF6503",
  },
  {
    id: "5",
    name: "Suresh P.",
    city: "Pune",
    quote: "Charging case is so simple. One charge lasts my whole workday plus evening TV.",
    product: "Starkey Genesis AI",
    accent: "#18AD8D",
  },
  {
    id: "6",
    name: "Meera D.",
    city: "Jaipur",
    quote: "My father finally enjoys phone calls again. The Bluetooth pairing took two minutes.",
    product: "ReSound Nexia R",
    accent: "#0F172A",
  },
];
