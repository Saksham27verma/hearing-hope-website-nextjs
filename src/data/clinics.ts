import type { ClinicLocation } from "@/types";

export const clinics: ClinicLocation[] = [
  {
    slug: "rohini",
    name: "Rohini Branch",
    certification: "Signia Certified Center",
    address:
      "West Metro Station, Twin District Centre, G-14, Ground Floor Kings Mall, opp. Dr. Baba Saheb Ambedkar Hospital, Sector 10, Rohini, New Delhi, Delhi 110085",
    phoneDisplay: "+91-97118 71169",
    phoneTel: "+919711871169",
    hours: "Mon - Sat: 10:00 AM - 7:00 PM",
    images: [
      "/images/clinic/clinic-01.svg",
      "/images/clinic/clinic-02.svg",
      "/images/clinic/clinic-06.svg",
    ],
  },
  {
    slug: "green-park",
    name: "Green Park Branch",
    certification: "Best Sound Center",
    address:
      "Ground Floor, E-12, Green Park Main, Block E, Green Park, New Delhi, Delhi 110016",
    phoneDisplay: "+91-97118 71168",
    phoneTel: "+919711871168",
    hours: "Mon - Sat: 10:00 AM - 7:00 PM",
    images: [
      "/images/clinic/clinic-03.svg",
      "/images/clinic/clinic-04.svg",
      "/images/clinic/clinic-05.svg",
    ],
  },
  {
    slug: "indirapuram",
    name: "Indirapuram Branch",
    certification: "Multi Speciality Center",
    address:
      "Ground Floor, Krishna Apra, G-17, Plot No. 1, Shakti Khand 2, Indirapuram, Ghaziabad, Uttar Pradesh 201014",
    phoneDisplay: "+91-97118 71168",
    phoneTel: "+919711871168",
    hours: "Mon - Sat: 10:00 AM - 7:00 PM",
    images: [
      "/images/clinic/clinic-07.svg",
      "/images/clinic/clinic-01.svg",
      "/images/clinic/clinic-03.svg",
    ],
  },
  {
    slug: "sanjay-nagar",
    name: "Sanjay Nagar Branch",
    certification: "Best Sound Center",
    address:
      "Vardhman Hospital, District Centre, Duplex Flats, Block P, Sector 23, Sanjay Nagar, Ghaziabad, Uttar Pradesh 201017",
    phoneDisplay: "+91-97118 71168",
    phoneTel: "+919711871168",
    hours: "Mon - Sat: 10:00 AM - 7:00 PM",
    images: [
      "/images/clinic/clinic-02.svg",
      "/images/clinic/clinic-06.svg",
      "/images/clinic/clinic-04.svg",
    ],
  },
];

export function mapsDirectionsHref(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}
