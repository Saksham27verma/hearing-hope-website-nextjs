"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteHeroSlide, saveHeroSlide, saveSitePage } from "@/app/admin/site-actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { RepeatList } from "@/components/admin/RepeatList";
import { adminField, adminLabel } from "@/components/admin/ui";
import { SitePhotosManager } from "@/components/admin/SitePhotosManager";
import type { AdminSitePhotos } from "@/lib/admin-site-media";
import type { HeroSlide, SitePageDoc, SitePageId } from "@/lib/site-cms/types";

const titles: Record<SitePageId, string> = {
  home: "Home",
  about: "About",
  clinics: "Clinics page",
  services: "Services page",
  "hearing-aids": "Hearing aids page",
  pricing: "Pricing",
  blog: "Blog index",
};

export function PageForm({
  page,
  slides = [],
  photos,
}: {
  page: SitePageDoc;
  slides?: HeroSlide[];
  photos?: AdminSitePhotos;
}) {
  const router = useRouter();
  const [metaTitle, setMetaTitle] = useState(page.metaTitle);
  const [metaDescription, setMetaDescription] = useState(page.metaDescription);
  const [fields, setFields] = useState(page.fields as Record<string, unknown>);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(key: string, value: unknown) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await saveSitePage({
      id: page.id,
      metaTitle,
      metaDescription,
      fields,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatus("Page saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Pages</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">{titles[page.id]}</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">Change the copy and photos visitors see on this page.</p>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {status ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</p> : null}

      <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">SEO</h2>
        <div className="mt-4 grid gap-4">
          <label>
            <span className={adminLabel}>Meta title</span>
            <input className={adminField} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          </label>
          <label>
            <span className={adminLabel}>Meta description</span>
            <textarea className={adminField} rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
          </label>
        </div>
      </section>

      <PageFields id={page.id} fields={fields} set={set} />

      {page.id === "home" ? (
        <>
          <HeroSlidesEditor slides={slides} />
          {photos ? (
            <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
              <h2 className="text-lg font-bold">Homepage gallery</h2>
              <p className="mt-1 text-sm text-brand-muted">Same 7-slot mosaic as the public homepage.</p>
              <div className="mt-6">
                <SitePhotosManager initial={photos} galleryOnly />
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      <button type="submit" disabled={pending} className="rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Save page"}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className={adminLabel}>{label}</span>
      {rows ? (
        <textarea className={adminField} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={adminField} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function PageFields({
  id,
  fields,
  set,
}: {
  id: SitePageId;
  fields: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}) {
  const str = (key: string) => String(fields[key] ?? "");

  if (id === "home") {
    return (
      <section className="space-y-6 rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Hero and sections</h2>
        <Field label="Eyebrow" value={str("heroEyebrow")} onChange={(v) => set("heroEyebrow", v)} />
        <Field label="Title" value={str("heroTitle")} onChange={(v) => set("heroTitle", v)} />
        <Field label="Highlight word" value={str("heroHighlight")} onChange={(v) => set("heroHighlight", v)} />
        <Field label="Body" value={str("heroBody")} onChange={(v) => set("heroBody", v)} rows={3} />
        <Field label="Why choose title" value={str("whyChooseTitle")} onChange={(v) => set("whyChooseTitle", v)} />
        <Field label="Why choose body" value={str("whyChooseBody")} onChange={(v) => set("whyChooseBody", v)} rows={3} />
        <Field label="Reviews title" value={str("reviewsTitle")} onChange={(v) => set("reviewsTitle", v)} />
        <Field label="FAQ title" value={str("faqTitle")} onChange={(v) => set("faqTitle", v)} />
        <p className={adminLabel}>Trust stats</p>
        <RepeatList
          items={(fields.trustStats as { value: string; label: string }[]) ?? []}
          onChange={(trustStats) => set("trustStats", trustStats)}
          create={() => ({ value: "", label: "" })}
          addLabel="Add stat"
          render={(item, _i, update) => (
            <div className="grid gap-3 pr-8 sm:grid-cols-2">
              <input className={adminField} value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} />
              <input className={adminField} value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} />
            </div>
          )}
        />
        <p className={adminLabel}>Why choose rows</p>
        <RepeatList
          items={(fields.whyChooseRows as { feature: string; hope: boolean; clinics: boolean }[]) ?? []}
          onChange={(whyChooseRows) => set("whyChooseRows", whyChooseRows)}
          create={() => ({ feature: "", hope: true, clinics: false })}
          addLabel="Add row"
          render={(item, _i, update) => (
            <div className="pr-8">
              <input className={adminField} value={item.feature} onChange={(e) => update({ ...item, feature: e.target.value })} />
            </div>
          )}
        />
      </section>
    );
  }

  if (id === "about") {
    return (
      <section className="space-y-6 rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">About copy</h2>
        <Field label="Eyebrow" value={str("eyebrow")} onChange={(v) => set("eyebrow", v)} />
        <Field label="Title" value={str("title")} onChange={(v) => set("title", v)} />
        <Field label="Highlight" value={str("highlight")} onChange={(v) => set("highlight", v)} />
        <Field label="Title after" value={str("titleAfter")} onChange={(v) => set("titleAfter", v)} />
        <Field label="Body" value={str("body")} onChange={(v) => set("body", v)} rows={4} />
        <Field label="Story title" value={str("storyTitle")} onChange={(v) => set("storyTitle", v)} />
        <Field label="Story body 1" value={str("storyBody1")} onChange={(v) => set("storyBody1", v)} rows={4} />
        <Field label="Story body 2" value={str("storyBody2")} onChange={(v) => set("storyBody2", v)} rows={3} />
        <Field label="Quote" value={str("quote")} onChange={(v) => set("quote", v)} rows={2} />
        <Field label="Quote by" value={str("quoteBy")} onChange={(v) => set("quoteBy", v)} />
        <Field label="Team title" value={str("teamTitle")} onChange={(v) => set("teamTitle", v)} />
        <Field label="Team body" value={str("teamBody")} onChange={(v) => set("teamBody", v)} rows={3} />
        <p className={adminLabel}>Hero photos</p>
        <RepeatList
          items={(fields.heroImages as { src: string; alt: string; label: string }[]) ?? []}
          onChange={(heroImages) => set("heroImages", heroImages)}
          create={() => ({ src: "", alt: "", label: "" })}
          addLabel="Add photo"
          render={(item, index, update) => (
            <div className="grid gap-3 pr-8">
              <CmsImageField label={`Photo ${index + 1}`} folder="about" value={item.src} onChange={(src) => update({ ...item, src })} />
              <input className={adminField} placeholder="Label" value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} />
              <input className={adminField} placeholder="Alt" value={item.alt} onChange={(e) => update({ ...item, alt: e.target.value })} />
            </div>
          )}
        />
      </section>
    );
  }

  if (id === "clinics" || id === "services" || id === "hearing-aids") {
    const perksKey = id === "clinics" ? "perks" : id === "services" ? "pillars" : "steps";
    return (
      <section className="space-y-6 rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <Field label="Eyebrow" value={str("eyebrow")} onChange={(v) => set("eyebrow", v)} />
        <Field label="Title" value={str("title")} onChange={(v) => set("title", v)} />
        <Field label="Body" value={str("body")} onChange={(v) => set("body", v)} rows={4} />
        {id === "services" ? (
          <>
            <CmsImageField label="Hero main" folder="services" value={str("heroMain")} onChange={(v) => set("heroMain", v)} />
            <CmsImageField label="Hero side 1" folder="services" value={str("heroSide1")} onChange={(v) => set("heroSide1", v)} />
            <CmsImageField label="Hero side 2" folder="services" value={str("heroSide2")} onChange={(v) => set("heroSide2", v)} />
          </>
        ) : null}
        {id === "hearing-aids" ? (
          <CmsImageField label="Hero image" folder="hearing-aids" value={str("heroImage")} onChange={(v) => set("heroImage", v)} />
        ) : null}
        <p className={adminLabel}>Sections</p>
        <RepeatList
          items={(fields[perksKey] as { title: string; body: string }[]) ?? []}
          onChange={(items) => set(perksKey, items)}
          create={() => ({ title: "", body: "" })}
          addLabel="Add block"
          render={(item, _i, update) => (
            <div className="grid gap-3 pr-8">
              <input className={adminField} value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
              <textarea className={adminField} rows={3} value={item.body} onChange={(e) => update({ ...item, body: e.target.value })} />
            </div>
          )}
        />
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl bg-white p-6 ring-1 ring-black/5">
      <Field label="Title" value={str("title")} onChange={(v) => set("title", v)} />
      <Field label="Body" value={str("body")} onChange={(v) => set("body", v)} rows={4} />
      {id === "pricing" ? <Field label="Catalog heading" value={str("catalogHeading")} onChange={(v) => set("catalogHeading", v)} /> : null}
      {id === "blog" ? <Field label="Eyebrow" value={str("eyebrow")} onChange={(v) => set("eyebrow", v)} /> : null}
    </section>
  );
}

function HeroSlidesEditor({ slides }: { slides: HeroSlide[] }) {
  const router = useRouter();
  const [items, setItems] = useState(slides);
  const [error, setError] = useState<string | null>(null);

  async function persist(next: HeroSlide, index: number) {
    const result = await saveHeroSlide({
      id: next.id,
      src: next.src,
      alt: next.alt,
      storagePath: next.storagePath,
      published: next.published,
      sortOrder: index + 1,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setItems((current) => current.map((item, i) => (i === index ? { ...next, id: result.id } : item)));
    router.refresh();
  }

  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
      <h2 className="text-lg font-bold">Hero slides</h2>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <div className="mt-4 space-y-4">
        {items.map((slide, index) => (
          <div key={slide.id ?? index} className="grid gap-3 rounded-2xl bg-brand-surface p-4 sm:grid-cols-[1fr_auto]">
            <CmsImageField
              label={`Slide ${index + 1}`}
              folder="hero"
              value={slide.src}
              onChange={(src) => void persist({ ...slide, src }, index)}
            />
            <div className="flex flex-col gap-2">
              <input
                className={adminField}
                value={slide.alt}
                placeholder="Alt text"
                onBlur={(e) => void persist({ ...slide, alt: e.target.value }, index)}
                onChange={(e) => setItems((current) => current.map((item, i) => (i === index ? { ...item, alt: e.target.value } : item)))}
              />
              <button
                type="button"
                className="text-sm font-semibold text-red-600"
                onClick={async () => {
                  if (slide.id) await deleteHeroSlide(slide.id);
                  setItems((current) => current.filter((_, i) => i !== index));
                  router.refresh();
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-semibold text-brand-teal"
          onClick={() => setItems((current) => [...current, { src: "", alt: "", sortOrder: current.length + 1, published: true }])}
        >
          Add slide
        </button>
      </div>
    </section>
  );
}
