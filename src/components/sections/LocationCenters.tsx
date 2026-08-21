import { clinics } from "@/data/clinics";
import { ClinicCard } from "@/components/clinics/ClinicCard";

function ClinicRow() {
  return (
    <ul className="flex min-w-max items-stretch gap-5 px-4">
      {clinics.map((clinic) => (
        <li key={clinic.slug} className="w-[300px] shrink-0 sm:w-[320px]">
          <ClinicCard clinic={clinic} />
        </li>
      ))}
    </ul>
  );
}

export function LocationCenters() {
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
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-teal">
            Our care centers
          </p>
          <h2 id="locations-heading" className="mt-2 text-3xl font-bold sm:text-4xl">
            <span className="italic text-brand-teal">Locations</span>{" "}
            <span className="text-brand-dark">We Serve</span>
          </h2>
          <p className="mt-3 text-brand-muted">
            Four certified clinics in Delhi NCR, plus new centres coming soon in Gurgaon, Noida,
            Dehradun and Chandigarh.
          </p>
        </div>
      </div>

      <div className="relative pb-16">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-white to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-white to-transparent sm:w-20" />
        <div className="flex w-max animate-clinics-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
          <ClinicRow />
          <ClinicRow />
        </div>
      </div>
    </section>
  );
}
