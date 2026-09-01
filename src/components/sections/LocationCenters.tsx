import Link from "next/link";
import { ArrowUpRight, Home, MapPin } from "lucide-react";
import { ClinicCard } from "@/components/clinics/ClinicCard";
import { listComingSoonClinics, listOpenClinics } from "@/lib/site-cms";
import type { ClinicLocation } from "@/types";

export function ComingSoonNote({ clinics }: { clinics?: ClinicLocation[] }) {
  if (!clinics?.length) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Coming soon</p>
      <p className="mt-2 text-sm text-brand-muted">New walk-in clinics — join the waitlist for opening week</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {clinics.map((clinic) => {
          const city = clinic.name.replace(" Branch", "");
          return (
            <li key={clinic.slug}>
              <Link
                href="/#book-test"
                className="group flex items-center justify-between gap-4 rounded-[1.25rem] bg-white px-5 py-4 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:ring-brand-orange/40 hover:shadow-[0_16px_40px_-28px_rgba(255,101,3,0.45)]"
              >
                <span className="flex min-w-0 items-center gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                      Opening soon
                    </span>
                    <span className="mt-0.5 block text-2xl font-bold tracking-tight text-brand-dark sm:text-[1.7rem]">
                      {city}
                    </span>
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-teal transition group-hover:text-brand-orange">
                  Notify me
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export async function LocationCenters() {
  const [openClinics, comingSoonClinics] = await Promise.all([listOpenClinics(), listComingSoonClinics()]);
  return (
    <section id="locations" className="relative overflow-hidden bg-transparent" aria-labelledby="locations-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-teal/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-brand-orange/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-teal">
              Our care centers
            </p>
            <h2 id="locations-heading" className="mt-2 text-3xl font-bold sm:text-4xl">
              <span className="italic text-brand-teal">Locations</span>{" "}
              <span className="text-brand-dark">We Serve</span>
            </h2>
            <p className="mt-3 text-brand-muted">
              Four certified clinics in Delhi NCR — and home hearing tests anywhere in the region.
              New walk-in centres are coming soon in Gurgaon and Noida.
            </p>
          </div>
          <Link
            href="/clinics"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-teal transition hover:text-brand-orange"
          >
            Maps and directions
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-[#07111F] p-6 text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                <Home className="h-3.5 w-3.5" aria-hidden="true" />
                Home services · All over Delhi NCR
              </p>
              <h3 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Can&apos;t visit a clinic? We come to you
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">
                Book a home hearing test, trial or fitting anywhere in Delhi, Gurugram, Noida,
                Ghaziabad and Greater Noida. Same audiologist-led care as a clinic visit — at your
                door.
              </p>
            </div>
            <Link
              href="/#book-test"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
            >
              Book a home test
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {openClinics.map((clinic) => (
            <li key={clinic.slug}>
              <ClinicCard clinic={clinic} />
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <ComingSoonNote clinics={comingSoonClinics} />
        </div>
      </div>
    </section>
  );
}
