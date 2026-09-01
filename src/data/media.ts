/**
 * Swap these files in `public/images/` — keep the same names, or update `src` here.
 *
 * Hero carousel:  public/images/hero/slide-01.webp … slide-06.webp
 * Brand marquee:  public/images/brands/{signia,phonak,widex,oticon,resound,starkey}.svg
 * Clinic gallery and branch cards: upload in the CMS at /admin/photos
 *   (placeholders live in public/images/clinic/ until you add real photos).
 * Clinics page hero: public/images/clinics/hero-main.jpg
 * Hospital logos: public/images/hospitals/{shree-aggarsain,rgcirc,vardhman}.png
 * Awards carousel: public/images/awards/award-01.svg … award-08.svg
 * Services pages:   public/images/services/{slug}.jpg and hero-main / hero-side-1 / hero-side-2.jpg
 * Team portraits:   public/images/team/{slug}.jpg
 *
 * Catalog model photos are uploaded in the CMS (/admin/products).
 * Clinic gallery and location-card photos are uploaded in the CMS (/admin/photos).
 *
 * PNG/JPG/WebP: drop the file and keep the `src` extension in sync.
 * Bump `heroSlideVersion` after replacing a hero file so caches pick up the new photo.
 */
const heroSlideVersion = "20260826";

export const heroSlides = [
  {
    src: `/images/hero/slide-01.webp?v=${heroSlideVersion}`,
    alt: "Rechargeable hearing aids in an open charging case",
  },
  {
    src: `/images/hero/slide-02.webp?v=${heroSlideVersion}`,
    alt: "Signia rechargeable hearing aids in a charging case",
  },
  {
    src: `/images/hero/slide-03.webp?v=${heroSlideVersion}`,
    alt: "Behind-the-ear hearing aid with charger",
  },
  {
    src: `/images/hero/slide-04.webp?v=${heroSlideVersion}`,
    alt: "Custom in-the-canal hearing aid",
  },
  {
    src: `/images/hero/slide-05.webp?v=${heroSlideVersion}`,
    alt: "Hearing aid product showcase",
  },
  {
    src: `/images/hero/slide-06.webp?v=${heroSlideVersion}`,
    alt: "Signia Active Pro IX earbud-style hearing aids",
  },
] as const;

export const brandLogos = [
  { src: "/images/brands/signia.svg", alt: "Signia" },
  { src: "/images/brands/phonak.svg", alt: "Phonak" },
  { src: "/images/brands/widex.svg", alt: "Widex" },
  { src: "/images/brands/oticon.svg", alt: "Oticon" },
  { src: "/images/brands/resound.svg", alt: "ReSound" },
  { src: "/images/brands/starkey.svg", alt: "Starkey" },
] as const;

export const clinicPhotos = [
  {
    src: "/images/clinic/clinic-01.svg",
    alt: "Hearing Hope clinic interior",
    area: "one",
  },
  {
    src: "/images/clinic/clinic-02.svg",
    alt: "Clinic waiting area",
    area: "two",
  },
  {
    src: "/images/clinic/clinic-03.svg",
    alt: "Audiologist with a patient",
    area: "three",
  },
  {
    src: "/images/clinic/clinic-04.svg",
    alt: "Happy patient after a hearing aid fitting",
    area: "four",
  },
  {
    src: "/images/clinic/clinic-05.svg",
    alt: "Hearing Hope clinic team",
    area: "five",
  },
  {
    src: "/images/clinic/clinic-06.svg",
    alt: "Hearing test and fitting room",
    area: "six",
  },
  {
    src: "/images/clinic/clinic-07.svg",
    alt: "One-on-one hearing consultation",
    area: "seven",
  },
] as const;

export const awards = [
  { src: "/images/awards/award-01.svg", alt: "Hearing Hope trophy", label: "Trophy" },
  { src: "/images/awards/award-02.svg", alt: "Hearing Hope certificate", label: "Certificate" },
  { src: "/images/awards/award-03.svg", alt: "Hearing Hope award medal", label: "Recognition" },
  { src: "/images/awards/award-04.svg", alt: "Hearing Hope certificate of excellence", label: "Certificate" },
  { src: "/images/awards/award-05.svg", alt: "Hearing Hope trophy", label: "Trophy" },
  { src: "/images/awards/award-06.svg", alt: "Hearing Hope official certificate", label: "Certificate" },
  { src: "/images/awards/award-07.svg", alt: "Hearing Hope award cup", label: "Trophy" },
  { src: "/images/awards/award-08.svg", alt: "Hearing Hope plaque", label: "Plaque" },
] as const;
