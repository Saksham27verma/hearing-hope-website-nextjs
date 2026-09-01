import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { serviceIcons } from "@/components/services/serviceIcons";
import { ImageSlot } from "@/components/services/ImageSlot";
import { getServiceBySlug, listServices } from "@/lib/site-cms";
import { getSiteSettings } from "@/lib/site-cms";
import { cn } from "@/lib/utils";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const services = await listServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [service, settings] = await Promise.all([getServiceBySlug(slug), getSiteSettings()]);
  if (!service) return { title: "Service" };

  return {
    title: service.title,
    description: service.excerpt,
    openGraph: {
      title: `${service.title} | ${settings.name}`,
      description: service.excerpt,
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, services] = await Promise.all([getServiceBySlug(slug), listServices()]);
  if (!service) notFound();

  const Icon = serviceIcons[service.icon];
  const others = services.filter((item) => item.slug !== service.slug).slice(0, 4);

  return (
    <main className="bg-brand-surface">
      <header className="relative overflow-hidden bg-[#07111F] text-white">
        <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-12 lg:px-6 lg:py-16">
          <div className="lg:col-span-6">
            <Link href="/services" className="text-sm font-medium text-brand-teal hover:underline">
              ← All services
            </Link>
            <div className="mt-6 flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-2xl",
                  service.accent,
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
                {service.category}
              </p>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{service.title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{service.what}</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
              <Clock className="h-4 w-4 text-brand-orange" />
              {service.duration}
            </p>
          </div>
          <ImageSlot
            src={service.image}
            alt={`${service.shortName} at Hearing Hope`}
            label={service.shortName}
            className="min-h-[240px] lg:col-span-6 lg:min-h-[340px]"
            rounded="rounded-[1.75rem]"
          />
        </div>
      </header>

      <article className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5 sm:p-8">
              <h2 className="text-lg font-bold text-brand-dark">Who it is for</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{service.who}</p>
              <h2 className="mt-8 text-lg font-bold text-brand-dark">What to expect</h2>
              <ul className="mt-3 space-y-3">
                {service.expect.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-brand-muted">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <ImageSlot
              src={service.detailImage || service.image}
              alt={`${service.shortName} procedure`}
              label={`${service.shortName} in clinic`}
              className="mt-6 min-h-[220px]"
            />
          </div>

          <aside className="lg:sticky lg:top-24 lg:col-span-5">
            <div className="rounded-[1.75rem] bg-brand-dark p-6 text-white">
              <p className="inline-flex items-center gap-2 text-sm text-slate-300">
                <Clock className="h-4 w-4 text-brand-orange" />
                {service.duration}
              </p>
              <h2 className="mt-3 text-xl font-bold">Book this service</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Our team will confirm a clinic or home slot. Fitting, counselling and remaining
                payment happen at the appointment.
              </p>
              <Link
                href="/#book-test"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
              >
                <CalendarDays className="h-4 w-4" />
                Book an appointment
              </Link>
              {service.slug === "hearing-aids" && (
                <Link
                  href="/hearing-aids"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
                >
                  Browse hearing aids
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="mt-4 rounded-[1.75rem] bg-white p-5 ring-1 ring-black/5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Other services
              </p>
              <ul className="mt-3 space-y-1">
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/services/${item.slug}`}
                      className="block rounded-lg px-2 py-2 text-sm font-medium text-brand-dark hover:bg-brand-surface"
                    >
                      {item.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
