import Image from "next/image";
import { Heart, Quote, Star } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.4 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4c-.2-.7-.4-1.4-.4-2.4s.1-1.7.4-2.4V6.5H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.5l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.3.6 4.5 1.7l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4 3.1C6.3 6.8 8.9 4.8 12 4.8z"
      />
    </svg>
  );
}

function Stars({ filled = 5, className }: { filled?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "h-3.5 w-3.5",
            index < filled ? "fill-brand-orange text-brand-orange" : "text-white/70",
          )}
        />
      ))}
    </span>
  );
}

function GoogleStars() {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-brand-orange text-brand-orange" />
      ))}
      <span className="relative h-4 w-4">
        <Star className="absolute inset-0 h-4 w-4 text-brand-border" />
        <span className="absolute inset-0 w-[80%] overflow-hidden">
          <Star className="h-4 w-4 fill-brand-orange text-brand-orange" />
        </span>
      </span>
    </span>
  );
}

export function PatientReviews() {
  return (
    <section className="bg-brand-surface/75" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-teal">
            Testimonials
          </p>
          <h2 id="reviews-heading" className="mt-2 text-3xl font-bold text-brand-dark sm:text-4xl">
            What Our <span className="text-brand-teal">Clients</span> Say
          </h2>
          <a
            href={site.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mt-5 inline-flex items-center gap-3 rounded-full border border-brand-border bg-white px-5 py-2.5 shadow-sm transition hover:border-brand-teal"
          >
            <GoogleMark className="h-6 w-6" />
            <span className="text-2xl font-bold tracking-tight text-brand-dark">{site.googleRating}</span>
            <GoogleStars />
            <span className="hidden text-sm text-brand-muted sm:inline">
              Google rating · {site.googleReviewCount} reviews
            </span>
          </a>
          <p className="mt-2 text-sm text-brand-muted sm:hidden">
            Google rating · {site.googleReviewCount} reviews
          </p>
        </div>

        <div
          className={cn(
            "mt-12 grid gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            "lg:[grid-template-areas:'teal_quote_photo'_'spotlight_orange_photo'_'spotlight_simple_peach']",
            "lg:[grid-template-rows:auto_auto_auto]",
          )}
        >
          <article className="flex flex-col rounded-[1.75rem] bg-[#E7F7F3] p-6 lg:[grid-area:teal]">
            <Stars />
            <p className="mt-4 text-base leading-7 text-brand-dark">
              Restaurant noise used to shut me out. Now I follow family conversations without
              asking people to repeat.
            </p>
            <footer className="mt-auto flex items-center gap-3 pt-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-teal">
                AS
              </span>
              <span>
                <span className="block font-semibold text-brand-dark">Anita Sharma</span>
                <span className="text-sm text-brand-muted">Rohini, Delhi</span>
              </span>
            </footer>
          </article>

          <article className="relative flex flex-col rounded-[1.75rem] border border-brand-border bg-white p-6 lg:[grid-area:quote]">
            <Quote className="absolute right-5 top-5 h-10 w-10 text-brand-orange/15" />
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface text-sm font-bold text-brand-dark">
                RK
              </span>
              <span>
                <span className="block font-semibold text-brand-dark">Ramesh Kumar</span>
                <span className="text-sm text-brand-muted">Green Park patient</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-brand-muted">
              First time I heard birds in my garden after 8 years. The home fitting was so gentle,
              and every price was explained before we started. No pressure — just honest care.
            </p>
            <p className="mt-4 text-xs font-medium text-brand-teal">Verified Google review</p>
          </article>

          <article className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-black/5 lg:[grid-area:photo]">
            <div className="relative h-48 lg:h-56">
              <Image
                src="/images/clinic/clinic-03.svg"
                alt="Patient consultation at Hearing Hope"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-brand-dark">Hearing my grandkids again</h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                “My father finally enjoys phone calls again. The Bluetooth pairing took two
                minutes.”
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-[#E7F7F3] px-3 py-1 text-xs font-semibold text-brand-teal">
                  Verified Patient
                </span>
                <span className="text-xs font-medium text-brand-muted">Meera D. · Jaipur</span>
              </div>
            </div>
          </article>

          <article className="relative min-h-[260px] overflow-hidden rounded-[1.75rem] lg:[grid-area:spotlight]">
            <Image
              src="/images/products/ric.svg"
              alt="Hearing aid close-up"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-linear-to-t from-brand-dark via-brand-dark/50 to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-brand-orange px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Tech spotlight
            </span>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-sm leading-6">
                Charging case is so simple. One charge lasts my whole workday plus evening TV.
              </p>
              <p className="mt-3 text-sm font-semibold">Suresh Patel · Pune</p>
            </div>
          </article>

          <article className="flex flex-col rounded-[1.75rem] bg-brand-orange p-6 text-white lg:[grid-area:orange]">
            <Stars filled={5} />
            <p className="mt-4 text-lg font-semibold leading-7">
              The audiologist explained every price clearly. No pressure, just a proper test and a
              trial.
            </p>
            <p className="mt-auto pt-6 text-sm font-medium text-white/90">Joseph M. · Kochi</p>
          </article>

          <article className="flex flex-col rounded-[1.75rem] border border-brand-border bg-white p-6 lg:[grid-area:simple]">
            <p className="text-sm leading-6 text-brand-muted">
              I wanted something invisible. The CIC is comfortable all day and nobody notices it.
            </p>
            <footer className="mt-auto flex items-center gap-3 pt-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange/10 text-xs font-bold text-brand-orange">
                FQ
              </span>
              <span className="text-sm font-semibold text-brand-dark">Farah Qureshi</span>
            </footer>
          </article>

          <article className="flex flex-col rounded-[1.75rem] bg-[#FFF4ED] p-6 lg:[grid-area:peach]">
            <Heart className="h-8 w-8 text-brand-orange" />
            <p className="mt-4 font-semibold leading-6 text-brand-dark">
              Walked into the Indirapuram clinic unsure. Walked out with a plan I could actually
              afford.
            </p>
            <p className="mt-auto pt-5 text-sm text-brand-muted">Rajesh T. · Business owner</p>
          </article>
        </div>
      </div>
    </section>
  );
}
