import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Quote,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { TeamPortrait } from "@/components/about/TeamPortrait";
import { AwardsCarousel } from "@/components/sections/AwardsCarousel";
import { TrustStats } from "@/components/sections/TrustStats";
import { ImageSlot } from "@/components/services/ImageSlot";
import { team } from "@/data/team";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About Us",
    description:
      "Hearing Hope is India's trusted hearing care brand — 15+ years, expert audiologists, and a family-led team across Delhi NCR.",
    openGraph: {
      title: `About Us | ${site.name}`,
      description: site.tagline,
    },
  };
}

const principles = [
  {
    index: "01",
    title: "Patient-first care",
    body: "Your comfort sets the pace. We listen before we recommend, and we never rush a family into a device.",
  },
  {
    index: "02",
    title: "Honest practice",
    body: "Transparent MRP, plain-language reports and the same advice we would give our own parents.",
  },
  {
    index: "03",
    title: "Hospital-grade tools",
    body: "PTA, impedance, OAE, BERA and ASSR in quiet rooms — Signia-certified centres with partner hospital desks.",
  },
  {
    index: "04",
    title: "Care that continues",
    body: "Fine-tuning, speech therapy and after-care so hearing stays clear long after the first appointment.",
  },
];

const whyUs = [
  { icon: ShieldCheck, title: "Signia certified centres", body: "Trusted protocols, verified fittings." },
  { icon: Stethoscope, title: "Professional audiologists", body: "Diagnostics led by clinicians, not a sales floor." },
  { icon: Sparkles, title: "World-class equipment", body: "Full test battery for adults and children." },
  { icon: HeartHandshake, title: "Home visits too", body: "The same calm evaluation if travel is hard." },
];

const portraitAccent = ["orange", "teal", "dark"] as const;

export default async function AboutPage() {
  const featured = team.filter((member) => member.featured);
  const rest = team.filter((member) => !member.featured);

  return (
    <main className="bg-brand-surface">
      <section className="relative overflow-hidden bg-[#07111F] text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-orange/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-brand-teal/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_50%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-12 lg:px-6 lg:py-24">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-orange">
              About Hearing Hope
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl sm:leading-[1.05]">
              We exist so India can{" "}
              <span className="relative inline-block text-brand-orange">
                hear clearly
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-1 h-3 rounded-full bg-brand-orange/25"
                />
              </span>{" "}
              again.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
              A family-led audiology network in Delhi NCR — Signia certified, hospital-tied, and
              stubborn about honest prices. From a first PTA to a cochlear-implant conversation,
              the same team stays with you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#team"
                className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
              >
                Meet the team
              </Link>
              <Link
                href="/#book-test"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                <CalendarDays className="h-4 w-4" />
                Book an appointment
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:col-span-5">
            <ImageSlot
              src="/images/clinic/clinic-03.svg"
              alt="Hearing Hope consultation"
              label="Our clinics"
              className="col-span-2 min-h-[220px] lg:min-h-[260px]"
              rounded="rounded-[2rem]"
            />
            <ImageSlot
              src="/images/clinic/clinic-01.svg"
              alt="Audiology booth"
              label="Diagnostics"
              className="min-h-[140px]"
            />
            <ImageSlot
              src="/images/clinic/clinic-07.svg"
              alt="Family at Hearing Hope"
              label="Families we serve"
              className="min-h-[140px]"
            />
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Our story</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
              Built as a clinic. Run like a family.
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-muted sm:text-base">
              Hearing Hope began so people would not have to choose between clinical quality and
              being treated kindly. We are a unit of{" "}
              <span className="font-semibold text-brand-dark">{site.parentCompany}</span> — with
              open centres in Rohini, Green Park, Indirapuram and Sanjay Nagar, and desks inside
              partner hospitals.
            </p>
            <p className="mt-4 text-sm leading-7 text-brand-muted sm:text-base">
              Today we fit premium global brands, run a full diagnostic battery, and still explain
              every audiogram in language you can take home.
            </p>
            <blockquote className="relative mt-8 rounded-[1.75rem] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.4)] ring-1 ring-black/5">
              <Quote className="absolute right-5 top-5 h-8 w-8 text-brand-orange/20" />
              <p className="max-w-md text-base font-medium leading-7 text-brand-dark">
                “It is my dream to gift everyone the hope of hearing.”
              </p>
              <footer className="mt-3 text-sm text-brand-muted">Mrs. Neelam Verma · Director</footer>
            </blockquote>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {principles.map((item) => (
              <li
                key={item.index}
                className="rounded-[1.75rem] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
              >
                <span className="text-xs font-bold tracking-[0.2em] text-brand-orange">{item.index}</span>
                <h3 className="mt-3 text-lg font-bold text-brand-dark">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TrustStats />

      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((item) => (
            <li
              key={item.title}
              className="flex gap-3 rounded-[1.5rem] bg-white p-5 ring-1 ring-black/5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4ED] text-brand-orange">
                <item.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-brand-dark">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-brand-muted">{item.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section id="team" className="scroll-mt-24 px-4 py-16 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Our people</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-5xl">
              Meet the team
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-muted sm:text-base">
              Directors, audiologists and counsellors who know our patients by name. Drop portraits
              into the photo frames whenever you are ready.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 lg:grid-cols-2">
            {featured.map((member, index) => (
              <li
                key={member.slug}
                className="group overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] ring-1 ring-black/5"
              >
                <div className="grid sm:grid-cols-5">
                  <TeamPortrait
                    src={member.image}
                    name={member.name}
                    accent={index === 0 ? "orange" : "teal"}
                    className="min-h-[280px] sm:col-span-2 sm:min-h-full"
                    rounded="rounded-none"
                  />
                  <div className="flex flex-col justify-center p-6 sm:col-span-3 sm:p-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                      {member.honorific} · {member.role}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark">
                      {member.honorific} {member.name}
                    </h3>
                    {member.credentials ? (
                      <p className="mt-1 text-sm font-medium text-brand-teal">{member.credentials}</p>
                    ) : null}
                    <p className="mt-4 text-sm leading-7 text-brand-muted">{member.bio}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((member, index) => (
              <li
                key={member.slug}
                className="group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.4)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(255,101,3,0.22)]"
              >
                <TeamPortrait
                  src={member.image}
                  name={member.name}
                  accent={portraitAccent[index % portraitAccent.length]}
                  className="aspect-4/5 w-full"
                  rounded="rounded-none"
                />
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
                    {member.role}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-brand-dark">
                    {member.honorific} {member.name}
                  </h3>
                  {member.credentials ? (
                    <p className="mt-0.5 text-xs font-medium text-brand-teal">{member.credentials}</p>
                  ) : null}
                  <p className="mt-3 text-sm leading-6 text-brand-muted">{member.bio}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AwardsCarousel />

      <section className="px-4 py-16 lg:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-brand-dark px-8 py-12 text-white">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight">Silence is overrated.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Walk into a Hearing Hope clinic — or book a home test — and leave with a clear next
                step. No pressure. Just better hearing.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-200">
                {["Free first evaluation", "Same-day explanation", "After-care that actually follows up"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand-teal" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <Link
              href="/#book-test"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange px-6 py-3.5 text-sm font-semibold text-white hover:brightness-105"
            >
              <CalendarDays className="h-4 w-4" />
              Book an appointment
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
