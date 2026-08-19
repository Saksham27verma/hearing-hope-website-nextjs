import type { BlogPost } from "@/types";

export const blogs: BlogPost[] = [
  {
    slug: "signs-you-need-a-hearing-test",
    title: "7 signs it’s time for a hearing test",
    excerpt:
      "Turning the TV up, missing doorbells, or asking people to repeat themselves are early clues. Here’s when to book a 30-minute test.",
    category: "Hearing health",
    date: "12 Aug 2026",
    readTime: "4 min",
    image: "/images/blog/signs-hearing-test.svg",
    content: [
      "If conversations in noise feel tiring, or family members say you miss words, a professional hearing test is the safest next step.",
      "Hearing Hope audiologists complete a diagnostic test in about 30 minutes at home or in clinic, then explain results in plain language — with no obligation to buy.",
    ],
  },
  {
    slug: "ric-vs-bte-vs-cic",
    title: "RIC vs BTE vs CIC: which style fits you?",
    excerpt:
      "A simple guide to hearing aid types — from nearly invisible custom shells to powerful behind-the-ear devices.",
    category: "Guides",
    date: "4 Aug 2026",
    readTime: "5 min",
    image: "/images/blog/hearing-aid-styles.svg",
    content: [
      "RIC models balance power and discretion. BTE devices suit severe loss. CIC and IIC shells sit deeper in the canal for a hidden look.",
      "The right style depends on your audiogram, ear anatomy and lifestyle. We always fit after a proper evaluation, not from a catalogue alone.",
    ],
  },
  {
    slug: "hearing-aid-prices-india-2026",
    title: "Hearing aid prices in India: what to expect in 2026",
    excerpt:
      "From entry devices to premium AI rechargeable pairs — how MRP, offer price and after-care actually work.",
    category: "Pricing",
    date: "28 Jul 2026",
    readTime: "6 min",
    image: "/images/blog/prices-india.svg",
    content: [
      "Starter hearing aids may begin around ₹25,000, while premium rechargeable AI models can exceed ₹2 lakh per pair.",
      "Hearing Hope shows MRP and a special offer price before you trial. Final quotes depend on your audiogram, warranty pack and accessories.",
    ],
  },
  {
    slug: "free-home-hearing-test",
    title: "What happens in a free home hearing test?",
    excerpt:
      "An audiologist visits, tests both ears, and walks you through results in half an hour — no pressure to purchase.",
    category: "Services",
    date: "18 Jul 2026",
    readTime: "3 min",
    image: "/images/blog/home-test.svg",
    content: [
      "Home tests are ideal if travel is hard for an elderly parent. We bring calibrated equipment and explain every step.",
      "If a device is recommended, you can book a trial or visit Rohini, Green Park, Indirapuram or Sanjay Nagar.",
    ],
  },
  {
    slug: "rechargeable-hearing-aids",
    title: "Why rechargeable hearing aids are winning in India",
    excerpt:
      "All-day charge, fewer tiny batteries, and Bluetooth streaming — who should choose rechargeable, and who should not.",
    category: "Technology",
    date: "9 Jul 2026",
    readTime: "4 min",
    image: "/images/blog/rechargeable.svg",
    content: [
      "Most modern RIC and BTE models last a full day on one charge and sit in a compact charging case overnight.",
      "Very small CIC or IIC shells may still use batteries. We’ll recommend based on your ear size and daily routine.",
    ],
  },
  {
    slug: "helping-a-parent-with-hearing-loss",
    title: "How to talk to a parent about hearing loss",
    excerpt:
      "A gentle approach that leads to a free test — without arguments about ‘I can hear just fine’.",
    category: "Family care",
    date: "1 Jul 2026",
    readTime: "5 min",
    image: "/images/blog/family-care.svg",
    content: [
      "Start with specific moments: missed phone calls, TV volume, or family dinners. Offer a free test as information, not a sales visit.",
      "Our clinics in Delhi NCR and hospital desks make the first appointment easy to keep.",
    ],
  },
];

export function getBlogBySlug(slug: string) {
  return blogs.find((post) => post.slug === slug);
}
