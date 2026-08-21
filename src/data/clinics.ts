import type { ClinicLocation } from "@/types";

export const clinics: ClinicLocation[] = [
  {
    slug: "rohini",
    name: "Rohini Branch",
    city: "New Delhi",
    certification: "Signia Certified Center",
    address:
      "West Metro Station, Twin District Centre, G-14, Ground Floor Kings Mall, opp. Dr. Baba Saheb Ambedkar Hospital, Sector 10, Rohini, New Delhi, Delhi 110085",
    phoneDisplay: "+91-97118 71169",
    phoneTel: "+919711871169",
    hours: "Mon - Sat: 10:00 AM - 7:00 PM",
    lat: 28.715752,
    lng: 77.115371,
    blurb:
      "Flagship Signia centre next to Rohini West Metro — diagnostics, fittings and after-care under one roof.",
    images: [
      "/images/clinic/clinic-01.svg",
      "/images/clinic/clinic-02.svg",
      "/images/clinic/clinic-06.svg",
    ],
  },
  {
    slug: "green-park",
    name: "Green Park Branch",
    city: "New Delhi",
    certification: "Best Sound Center",
    address: "Ground Floor, E-12, Green Park Main, Block E, Green Park, New Delhi, Delhi 110016",
    phoneDisplay: "+91-97118 71168",
    phoneTel: "+919711871168",
    hours: "Mon - Sat: 10:00 AM - 7:00 PM",
    lat: 28.5599,
    lng: 77.2069,
    blurb:
      "South Delhi walk-in clinic for PTA, hearing-aid trials and fine-tuning — a short walk from Green Park Metro.",
    images: [
      "/images/clinic/clinic-03.svg",
      "/images/clinic/clinic-04.svg",
      "/images/clinic/clinic-05.svg",
    ],
  },
  {
    slug: "indirapuram",
    name: "Indirapuram Branch",
    city: "Ghaziabad",
    certification: "Multi Speciality Center",
    address:
      "Ground Floor, Krishna Apra, G-17, Plot No. 1, Shakti Khand 2, Indirapuram, Ghaziabad, Uttar Pradesh 201014",
    phoneDisplay: "+91-97118 71168",
    phoneTel: "+919711871168",
    hours: "Mon - Sat: 10:00 AM - 7:00 PM",
    lat: 28.6419,
    lng: 77.3674,
    blurb:
      "NCR family clinic in Shakti Khand 2 — paediatric tests, adult fittings and speech-therapy follow-ups.",
    images: [
      "/images/clinic/clinic-07.svg",
      "/images/clinic/clinic-01.svg",
      "/images/clinic/clinic-03.svg",
    ],
  },
  {
    slug: "sanjay-nagar",
    name: "Sanjay Nagar Branch",
    city: "Ghaziabad",
    certification: "Best Sound Center",
    address:
      "Vardhman Hospital, District Centre, Duplex Flats, Block P, Sector 23, Sanjay Nagar, Ghaziabad, Uttar Pradesh 201017",
    phoneDisplay: "+91-97118 71168",
    phoneTel: "+919711871168",
    hours: "Mon - Sat: 10:00 AM - 7:00 PM",
    lat: 28.6825,
    lng: 77.441,
    blurb:
      "In-hospital Hearing Hope desk at Vardhman Hospital — convenient if you already visit for ENT or family care.",
    images: [
      "/images/clinic/clinic-02.svg",
      "/images/clinic/clinic-06.svg",
      "/images/clinic/clinic-04.svg",
    ],
  },
  {
    slug: "gurgaon",
    name: "Gurgaon Branch",
    city: "Gurugram",
    certification: "Coming Soon",
    address:
      "Gurgaon, Haryana — our next certified care centre. Join the waitlist for launch appointments and opening offers.",
    phoneDisplay: "+91-97118 71168",
    phoneTel: "+919711871168",
    hours: "Opening soon",
    lat: 28.4595,
    lng: 77.0266,
    blurb: "A new Hearing Hope clinic for Gurugram is on the way. Join the waitlist to be first for a free test.",
    comingSoon: true,
    images: [
      "/images/clinic/clinic-05.svg",
      "/images/clinic/clinic-07.svg",
      "/images/clinic/clinic-01.svg",
    ],
  },
  {
    slug: "noida",
    name: "Noida Branch",
    city: "Noida",
    certification: "Coming Soon",
    address:
      "Noida, Uttar Pradesh — a new Hearing Hope clinic is on the way. Reserve your free hearing test for opening week.",
    phoneDisplay: "+91-97118 71168",
    phoneTel: "+919711871168",
    hours: "Opening soon",
    lat: 28.5355,
    lng: 77.391,
    blurb: "Noida clinic opening soon — reserve a launch-week hearing test for your family.",
    comingSoon: true,
    images: [
      "/images/clinic/clinic-04.svg",
      "/images/clinic/clinic-02.svg",
      "/images/clinic/clinic-07.svg",
    ],
  },
  {
    slug: "dehradun",
    name: "Dehradun Branch",
    city: "Dehradun",
    certification: "Coming Soon",
    address: "Dehradun, Uttarakhand — clinic opening soon. Get notified when audiologist slots go live.",
    phoneDisplay: "+91-97118 71168",
    phoneTel: "+919711871168",
    hours: "Opening soon",
    lat: 30.3165,
    lng: 78.0322,
    blurb: "Hearing Hope is coming to Dehradun. Get notified when audiologist appointments open.",
    comingSoon: true,
    images: [
      "/images/clinic/clinic-06.svg",
      "/images/clinic/clinic-03.svg",
      "/images/clinic/clinic-01.svg",
    ],
  },
  {
    slug: "chandigarh",
    name: "Chandigarh Branch",
    city: "Chandigarh",
    certification: "Coming Soon",
    address:
      "Chandigarh — our Tricity clinic is coming soon. Join the waitlist to be first for a free hearing test.",
    phoneDisplay: "+91-97118 71168",
    phoneTel: "+919711871168",
    hours: "Opening soon",
    lat: 30.7333,
    lng: 76.7794,
    blurb: "Tricity clinic coming soon — join the waitlist for a free hearing test at launch.",
    comingSoon: true,
    images: [
      "/images/clinic/clinic-01.svg",
      "/images/clinic/clinic-05.svg",
      "/images/clinic/clinic-04.svg",
    ],
  },
];

export const openClinics = clinics.filter((clinic) => !clinic.comingSoon);

export function mapsDirectionsHref(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function mapsPlaceHref(clinic: ClinicLocation) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name}, ${clinic.address}`)}`;
}

export function mapsEmbedSrc(clinic: ClinicLocation) {
  const query = clinic.comingSoon
    ? `${clinic.city}`
    : `${clinic.lat},${clinic.lng} (${clinic.name})`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${clinic.comingSoon ? 12 : 16}&output=embed`;
}

export function distanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.min(1, Math.sqrt(a)));
}
