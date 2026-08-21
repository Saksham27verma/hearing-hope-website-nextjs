import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  Stethoscope,
  Truck,
} from "lucide-react";
import { ClinicCard } from "@/components/clinics/ClinicCard";
import { ClinicLocator } from "@/components/clinics/ClinicLocator";
import { ClinicGallery } from "@/components/sections/ClinicGallery";
import { ImageSlot } from "@/components/services/ImageSlot";
import { SchemaScript } from "@/components/ui/SchemaScript";
import { clinics, openClinics } from "@/data/clinics";
import { hospitalPartners } from "@/data/content";
import { clinicListSchema } from "@/lib/schema";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Our Clinics",
    description:
      "Visit Hearing Hope in Rohini, Green Park, Indirapuram and Sanjay Nagar — or book a home hearing test across Delhi NCR. New clinics coming soon in Gurugram, Noida, Dehradun and Chandigarh.",
    openGraph: {
      title: `Our Clinics | ${site.name}`,
      description: "Find a Hearing Hope clinic near you, get directions, or book a free home test.",
    },
  };
}

const visitPerks = [
  {
    icon: Stethoscope,
    title: "Audiologist-led care",
    body: "Every walk-in is a diagnostic appointment — not a sales counter. You leave with a clear report and a plan.",
  },
  {
    icon: Home,
    title: "Home hearing tests",
    body: "If travel is hard, an audiologist can visit you. Same tests, same honest advice, no obligation to buy.",
  },
  {
    icon: Truck,
    title: "Fittings that come to you",
    body: "After you choose a model, remaining payment and the fit happen at the appointment — clinic or home.",
  },
  {
    icon: Clock,
    title: "Mon–Sat, 10 AM–7 PM",
    body: "Open centres keep regular hours. Call ahead for BERA, ASSR or paediatric slots that need extra time.",
  },
];

export default async function ClinicsPage() {
  const comingSoon = clinics.filter((clinic) => clinic.comingSoon);

  return (
    <main className="bg-brand-surface">
      <SchemaScript id="clinic-list-schema" data={clinicListSchema()} />
      <section className="relative overflow-hidden bg-[#07111F] text-white">
        <div className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-12 lg:px-6 lg:py-20">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Our clinics
            </p>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl sm:leading-[1.08]">
              Four open centres in Delhi NCR — and more on the way
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Walk into Rohini, Green Park, Indirapuram or Sanjay Nagar for a hearing test, a
              hearing-aid trial or speech therapy. Use the locator below for directions, or book a
              home visit if you would rather we come to you.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-200">
              {[
                "Near metro, malls and partner hospitals",
                "Certified Signia and Best Sound centres",
                "Same-day explanation of your results",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#locator"
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
              >
                <MapPin className="h-4 w-4" />
                Find a clinic
              </Link>
              <Link
                href="/#book-test"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                <CalendarDays className="h-4 w-4" />
                Book an appointment
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              {[
                { value: String(openClinics.length), label: "Open clinics" },
                { value: String(comingSoon.length), label: "Coming soon" },
                { value: "NCR+", label: "Home visits" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs text-slate-400">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-tight">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:col-span-6 lg:grid-rows-[minmax(220px,1fr)_minmax(160px,0.7fr)]">
            <ImageSlot
              src="/images/clinic/clinic-03.svg"
              alt="Hearing Hope clinic reception"
              label="Clinic reception"
              className="col-span-2 min-h-[220px] lg:min-h-[280px]"
              rounded="rounded-[1.75rem]"
            />
            <ImageSlot
              src="/images/clinic/clinic-01.svg"
              alt="Hearing test booth"
              label="Test booth"
              className="min-h-[150px]"
            />
            <ImageSlot
              src="/images/clinic/clinic-06.svg"
              alt="Fitting room"
              label="Fitting room"
              className="min-h-[150px]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">What you get</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
            A calm room, a real audiologist, a plan you can follow
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
            Bring any previous reports, hearing aids or implant processors. Children do best when
            they are rested. Parking and metro access vary by centre — the locator map shows exactly
            where to go.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visitPerks.map((perk) => (
            <li
              key={perk.title}
              className="rounded-[1.5rem] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-surface text-brand-teal">
                <perk.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-brand-dark">{perk.title}</h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{perk.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="locator" className="scroll-mt-24 px-4 pb-6 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Clinic locator
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
              Find the nearest Hearing Hope
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
              Search by neighbourhood, tap a centre, and the map will pin it. Use your location to
              sort by distance — then call, get Google directions, or book a visit.
            </p>
          </div>
          <ClinicLocator />
        </div>
      </section>

      <section id="open-clinics" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 lg:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Open now</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
            Walk-in clinics
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
            Rohini and Green Park in Delhi, Indirapuram and Sanjay Nagar in Ghaziabad. Hours are
            Monday to Saturday, 10:00 AM to 7:00 PM.
          </p>
        </div>
        <ul className="grid gap-5 md:grid-cols-2">
          {openClinics.map((clinic) => (
            <li key={clinic.slug}>
              <ClinicCard clinic={clinic} />
            </li>
          ))}
        </ul>
      </section>

      <ClinicGallery findHref="#locator" />

      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Coming soon</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
            New cities on the map
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted sm:text-base">
            Join the waitlist for Gurugram, Noida, Dehradun and Chandigarh. Until then, NCR home
            visits and the four open clinics remain available.
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {comingSoon.map((clinic) => (
            <li key={clinic.slug}>
              <ClinicCard clinic={clinic} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Hospital desks
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark">
            Also inside partner hospitals
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted">
            Hearing Hope runs hearing desks with leading hospitals — useful if you already have an
            ENT or oncology appointment on the same campus.
          </p>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {hospitalPartners.map((hospital) => (
              <li
                key={hospital.name}
                className="flex items-center gap-3 rounded-2xl bg-brand-surface px-3 py-3 ring-1 ring-black/5"
              >
                <div className="flex h-14 w-[7.5rem] shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-brand-border">
                  <Image
                    src={hospital.logo}
                    alt={`${hospital.name} logo`}
                    width={180}
                    height={48}
                    className="max-h-10 w-auto object-contain"
                  />
                </div>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug text-brand-dark">
                    {hospital.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-brand-muted">{hospital.location}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-16 lg:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-brand-dark px-8 py-10 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Prefer we come to you?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Book a home hearing test across Delhi NCR. An audiologist visits, completes the
              evaluation and explains results — with no obligation to buy.
            </p>
          </div>
          <Link
            href="/#book-test"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
          >
            <CalendarDays className="h-4 w-4" />
            Book a home test
          </Link>
        </div>
      </section>
    </main>
  );
}
