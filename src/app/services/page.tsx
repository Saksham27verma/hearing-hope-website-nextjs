import type { Metadata } from "next";
import Link from "next/link";
import { Home, Stethoscope, Truck } from "lucide-react";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Services & Clinics",
    description:
      "Free home hearing tests, clinic appointments and audiologist-led hearing aid fittings across 100+ Indian cities.",
    openGraph: {
      title: `Services & Clinics | ${site.name}`,
      description: "Book a free home test or visit a Hearing Hope clinic near you.",
    },
  };
}

const services = [
  {
    icon: Home,
    title: "Free home hearing test",
    body: "An audiologist visits you, completes a 30-minute test and explains results with no obligation.",
  },
  {
    icon: Stethoscope,
    title: "Clinic fittings",
    body: "Walk into a partner clinic for diagnostics, programming and after-care for every major brand.",
  },
  {
    icon: Truck,
    title: "Home trial & COD",
    body: "Try a recommended model at home, then reserve it on cash-on-delivery or a small advance token.",
  },
];

export default async function ServicesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      <h1 className="text-3xl font-bold text-brand-dark">Services / Our Clinics</h1>
      <p className="mt-3 max-w-2xl text-brand-muted">
        Hearing Hope is a pan-India audiology network. Book a free test at home or at a nearby
        clinic — same care, transparent pricing.
      </p>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {services.map((service) => (
          <li key={service.title} className="rounded-2xl border border-brand-border bg-brand-surface p-6">
            <service.icon className="h-8 w-8 text-brand-teal" />
            <h2 className="mt-4 text-lg font-semibold text-brand-dark">{service.title}</h2>
            <p className="mt-2 text-sm text-brand-muted">{service.body}</p>
          </li>
        ))}
      </ul>
      <Link
        href="/#book-test"
        className="mt-10 inline-flex rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white"
      >
        Book a free hearing test
      </Link>
    </main>
  );
}
