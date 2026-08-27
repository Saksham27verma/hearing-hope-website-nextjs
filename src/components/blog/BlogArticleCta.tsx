import Link from "next/link";
import { CalendarDays, CheckCircle2, Phone } from "lucide-react";
import { site, whatsappHref } from "@/lib/site";
import { toTelHref } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function BlogArticleCta() {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-brand-dark px-6 py-10 text-white sm:px-8">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Next step</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Ready for a clear answer on your hearing?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Book a free 30-minute test at home or in clinic. An audiologist explains results in plain
            language — with no obligation to buy.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-200">
            {["Free first evaluation", "Same-day explanation", "Home visit or clinic"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-teal" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto">
          <Link
            href="/#book-test"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-3.5 text-sm font-semibold text-white hover:brightness-105"
          >
            <CalendarDays className="h-4 w-4" />
            Book a free hearing test
          </Link>
          <a
            href={toTelHref(site.phoneTel)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5"
          >
            <Phone className="h-4 w-4" />
            {site.phoneDisplay}
          </a>
          <a
            href={whatsappHref("Hi Hearing Hope, I read a blog article and would like a free hearing test.")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
}
