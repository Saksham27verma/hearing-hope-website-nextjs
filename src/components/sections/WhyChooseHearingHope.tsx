import Link from "next/link";
import { Check, X } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/utils";

const columns = [
  { id: "hope", label: "Hearing Hope", highlight: true },
  { id: "clinics", label: "Typical clinics", highlight: false },
] as const;

const defaultRows = [
  { feature: "Audiologist-led diagnostic test", hope: true, clinics: false },
  { feature: "Complimentary first hearing check", hope: true, clinics: false },
  { feature: "Guidance from senior audiologists", hope: true, clinics: false },
  { feature: "Free hearing-aid trials (clinic or home)", hope: true, clinics: false },
  { feature: "Complimentary fine-tuning after the fit", hope: true, clinics: false },
  { feature: "Extended warranty support", hope: true, clinics: false },
  { feature: "Top global brands under one roof", hope: true, clinics: false },
] as const;

function Mark({ yes, highlight }: { yes: boolean; highlight?: boolean }) {
  if (yes) {
    return (
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm",
          highlight ? "bg-brand-orange shadow-brand-orange/30" : "bg-brand-teal",
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
        <span className="sr-only">Included</span>
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
      <span className="sr-only">Not included</span>
    </span>
  );
}

export function WhyChooseHearingHope({
  eyebrow,
  title,
  body,
  hopeLabel,
  otherLabel,
  rows,
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  hopeLabel?: string;
  otherLabel?: string;
  rows?: { feature: string; hope: boolean; clinics: boolean }[];
}) {
  const comparison = rows?.length ? rows : defaultRows;
  return (
    <section
      id="why-choose"
      className="relative overflow-hidden bg-transparent"
      aria-labelledby="why-choose-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-brand-teal/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
            {eyebrow ?? "The Hearing Hope difference"}
          </p>
          <h2 id="why-choose-heading" className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
            {title ?? "Why Choose Hearing Hope"}
          </h2>
          <p className="mt-3 text-brand-muted">
            {body ?? "Same premium brands — with a real audiologist, a free trial, and after-care that does not stop at the invoice."}
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] bg-white shadow-[0_28px_70px_-36px_rgba(15,23,42,0.45)] ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <caption className="sr-only">
                Comparison of Hearing Hope with typical clinics
              </caption>
              <thead>
                <tr className="border-b border-brand-border">
                  <th scope="col" className="px-5 py-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted sm:px-7">
                    What you get
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      scope="col"
                      className={cn(
                        "px-4 py-5 text-center sm:px-6",
                        column.highlight && "relative bg-brand-dark text-white",
                      )}
                    >
                      {column.highlight ? (
                        <span className="flex flex-col items-center gap-2">
                          <BrandLogo inverted className="h-8" />
                          <span className="rounded-full bg-brand-orange px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Recommended
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-brand-dark">{otherLabel ?? column.label}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-brand-border last:border-b-0",
                      index % 2 === 1 && "bg-brand-surface/60",
                    )}
                  >
                    <th
                      scope="row"
                      className="px-5 py-4 text-sm font-semibold text-brand-dark sm:px-7 sm:text-base"
                    >
                      {row.feature}
                    </th>
                    <td className="bg-brand-dark/[0.03] px-4 py-4 text-center sm:px-6">
                      <div className="flex justify-center">
                        <Mark yes={row.hope} highlight />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center sm:px-6">
                      <div className="flex justify-center">
                        <Mark yes={row.clinics} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-brand-muted">
          Ready to hear the difference?{" "}
          <Link href="/#book-test" className="font-semibold text-brand-orange hover:underline">
            Book a complimentary check-up
          </Link>
        </p>
      </div>
    </section>
  );
}
