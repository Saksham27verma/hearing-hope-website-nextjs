export const site = {
  name: "Hearing Hope",
  tagline: "India's Trusted Name in Hearing Care",
  description:
    "Book a free hearing test, compare premium hearing aids from Signia, Phonak, Widex and Oticon, and get transparent pricing with home trials across 100+ Indian cities.",
  url: "https://www.hearinghope.in",
  phoneDisplay: "+91 98765 43210",
  phoneTel: "+919876543210",
  whatsappNumber: "919876543210",
  email: "care@hearinghope.in",
  address: {
    street: "Pan-India Clinic Network",
    locality: "New Delhi",
    region: "Delhi",
    postalCode: "110001",
    country: "IN",
  },
  ratingValue: "4.8",
  reviewCount: "12840",
  googleRating: "4.8",
  googleReviewCount: "1,200+",
  googleReviewsUrl: "https://www.google.com/search?q=Hearing+Hope+clinic+reviews",
  parentCompany: "Hope Digital Innovations Pvt Ltd",
  social: {
    facebook: "https://www.facebook.com/hearinghope",
    instagram: "https://www.instagram.com/hearinghope",
    youtube: "https://www.youtube.com/@hearinghope",
  },
} as const;

export function whatsappHref(message?: string) {
  const text =
    message ??
    "Hi Hearing Hope, I would like to book a free hearing test.";
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
