import Link from "next/link";
import type { ReactNode } from "react";
import { contentPagePath, isReviewedMedicalPage, type PublishedContentPage } from "@/lib/content-pages";
import { JsonLd } from "./JsonLd";

const labels = {
  test: "Hearing test guide",
  condition: "Hearing health guide",
  product: "Hearing aid guide",
  comparison: "Comparison guide",
  guide: "Practical guide",
  clinic: "Clinic guide",
  blog: "Hearing care article",
  landing: "Hearing care",
} as const;

function MarkdownBlocks({ value }: { value: string }) {
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return (
    <div className="space-y-4 text-base leading-8 text-brand-muted sm:text-lg">
      {lines.map((line, index) => {
        if (line.startsWith("### ")) return <h3 key={`${index}-${line}`} className="pt-3 text-lg font-bold text-brand-dark">{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={`${index}-${line}`} className="pt-5 text-2xl font-bold tracking-tight text-brand-dark">{line.slice(3)}</h2>;
        if (line.startsWith("- ")) return <li key={`${index}-${line}`} className="ml-5 list-disc pl-1">{line.slice(2)}</li>;
        return <p key={`${index}-${line}`}>{line}</p>;
      })}
    </div>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section data-content-section={number} className="border-t border-black/5 py-8 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">{String(number).padStart(2, "0")}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-dark">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ContentPageTemplate({ page }: { page: PublishedContentPage }) {
  const reviewed = isReviewedMedicalPage(page);
  return (
    <main className="bg-brand-surface">
      <JsonLd data={page.jsonLd} />
      <header className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">{labels[page.pageType]}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl lg:text-5xl">{page.title}</h1>
          {page.answerSummary ? <p className="mt-5 max-w-3xl text-lg leading-8 text-brand-muted">{page.answerSummary}</p> : null}
          {reviewed ? (
            <p className="mt-6 text-sm text-brand-muted">
              Medically reviewed by <span className="font-semibold text-brand-dark">{page.reviewerName}</span>{" "}
              <time dateTime={page.reviewedAt ?? undefined}>{new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(page.reviewedAt!))}</time>
            </p>
          ) : null}
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-10 lg:px-6 lg:py-14">
        <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5 sm:p-10">
          <Section number={1} title="The short answer"><p className="text-base leading-8 text-brand-muted">{page.answerSummary || "This page is being prepared by the Hearing Hope clinical team."}</p></Section>
          <Section number={2} title="Who this information is for"><p className="text-base leading-8 text-brand-muted">Use this guide to prepare for an informed conversation with an audiologist. It cannot diagnose hearing loss or replace an in-person assessment.</p></Section>
          <Section number={3} title="What to know"><MarkdownBlocks value={page.bodyMarkdown} /></Section>
          <Section number={4} title="Options and next steps"><p className="text-base leading-8 text-brand-muted">An audiologist can explain which test, device, or care pathway fits your hearing needs, daily routine, and budget.</p></Section>
          <Section number={5} title="Frequently asked questions">
            {page.faqItems.length ? <dl className="space-y-6">{page.faqItems.map((faq) => <div key={faq.question}><dt className="font-semibold text-brand-dark">{faq.question}</dt><dd className="mt-2 text-base leading-7 text-brand-muted">{faq.answer}</dd></div>)}</dl> : <p className="text-base leading-8 text-brand-muted">Please ask our team any question you would like clarified before booking.</p>}
          </Section>
          <Section number={6} title="Sources and further reading">
            {page.sources.length ? <ul className="space-y-2 text-sm">{page.sources.map((source, index) => <li key={`${source.url ?? source.name}-${index}`}>{source.url ? <a className="text-brand-teal underline" href={source.url} rel="noreferrer">{source.title || source.name || source.url}</a> : source.title || source.name}</li>)}</ul> : <p className="text-base leading-8 text-brand-muted">Sources are reviewed by the clinical team before publication.</p>}
          </Section>
          <Section number={7} title="Speak with Hearing Hope"><p className="text-base leading-8 text-brand-muted">For a clinic or home appointment in Delhi NCR, our team can help you decide the appropriate next step.</p><Link href="/#book-test" className="mt-5 inline-flex rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white">Book an appointment</Link></Section>
        </div>
        {page.internalLinks.length ? <nav aria-label="Related pages" className="mt-6 rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5"><h2 className="text-lg font-bold text-brand-dark">Related guides</h2><ul className="mt-3 flex flex-wrap gap-3">{page.internalLinks.map((slug) => <li key={slug}><Link href={contentPagePath(slug)} className="text-sm font-medium text-brand-teal underline">{slug.replaceAll("-", " ")}</Link></li>)}</ul></nav> : null}
      </article>
    </main>
  );
}
