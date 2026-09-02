"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteHeroSlide, saveHeroSlide, saveSitePage } from "@/app/admin/site-actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { PageLayoutPreview } from "@/components/admin/PageLayoutPreview";
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
  const metaTitleRef = useRef(metaTitle);
  const metaDescriptionRef = useRef(metaDescription);
  const fieldsRef = useRef(fields);
  metaTitleRef.current = metaTitle;
  metaDescriptionRef.current = metaDescription;
  fieldsRef.current = fields;

  function set(key: string, value: unknown) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function persist(nextFields: Record<string, unknown>) {
    const result = await saveSitePage({
      id: page.id,
      metaTitle: metaTitleRef.current,
      metaDescription: metaDescriptionRef.current,
      fields: nextFields,
    });
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setError(null);
    router.refresh();
    return true;
  }

  async function setImage(key: string, value: unknown) {
    const next = { ...fieldsRef.current, [key]: value };
    fieldsRef.current = next;
    setFields(next);
    const saved = await persist(next);
    if (saved) setStatus("Photo saved — it is live on the website.");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const saved = await persist(fields);
    setPending(false);
    if (saved) setStatus("Page saved.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Pages</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">{titles[page.id]}</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Change the copy and photos visitors see on this page. Photos dropped onto the preview save
          immediately.
        </p>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {status ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</p> : null}

      <PageLayoutPreview id={page.id} fields={fields} onChange={(key, value) => void setImage(key, value)} />

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

      <PageFields id={page.id} fields={fields} set={set} onImage={setImage} />

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

function StringList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <p className={adminLabel}>{label}</p>
      <RepeatList
        items={items}
        onChange={onChange}
        create={() => ""}
        addLabel="Add line"
        render={(item, _i, update) => (
          <input className={`${adminField} pr-8`} value={item} onChange={(e) => update(e.target.value)} />
        )}
      />
    </div>
  );
}

function PageFields({
  id,
  fields,
  set,
  onImage,
}: {
  id: SitePageId;
  fields: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  onImage: (key: string, value: unknown) => void;
}) {
  const str = (key: string) => String(fields[key] ?? "");

  if (id === "home") {
    return (
      <section className="space-y-6 rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Hero and sections</h2>
        <Field label="Rating line" value={str("ratingLine")} onChange={(v) => set("ratingLine", v)} />
        <Field label="Eyebrow" value={str("heroEyebrow")} onChange={(v) => set("heroEyebrow", v)} />
        <Field label="Title" value={str("heroTitle")} onChange={(v) => set("heroTitle", v)} />
        <Field label="Highlight word" value={str("heroHighlight")} onChange={(v) => set("heroHighlight", v)} />
        <Field label="Body" value={str("heroBody")} onChange={(v) => set("heroBody", v)} rows={3} />
        <Field label="Services heading" value={str("servicesHeading")} onChange={(v) => set("servicesHeading", v)} />
        <p className={adminLabel}>Hero services</p>
        <RepeatList
          items={(fields.heroServices as { slug: string; label: string; hint: string }[]) ?? []}
          onChange={(heroServices) => set("heroServices", heroServices)}
          create={() => ({ slug: "", label: "", hint: "" })}
          addLabel="Add service"
          render={(item, _i, update) => (
            <div className="grid gap-3 pr-8 sm:grid-cols-3">
              <input className={adminField} placeholder="Slug" value={item.slug} onChange={(e) => update({ ...item, slug: e.target.value })} />
              <input className={adminField} placeholder="Label" value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} />
              <input className={adminField} placeholder="Hint" value={item.hint} onChange={(e) => update({ ...item, hint: e.target.value })} />
            </div>
          )}
        />
        <Field label="Why choose eyebrow" value={str("whyChooseEyebrow")} onChange={(v) => set("whyChooseEyebrow", v)} />
        <Field label="Why choose title" value={str("whyChooseTitle")} onChange={(v) => set("whyChooseTitle", v)} />
        <Field label="Why choose body" value={str("whyChooseBody")} onChange={(v) => set("whyChooseBody", v)} rows={3} />
        <Field label="Reviews eyebrow" value={str("reviewsEyebrow")} onChange={(v) => set("reviewsEyebrow", v)} />
        <Field label="Reviews title" value={str("reviewsTitle")} onChange={(v) => set("reviewsTitle", v)} />
        <Field label="FAQ eyebrow" value={str("faqEyebrow")} onChange={(v) => set("faqEyebrow", v)} />
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
        <Field label="Primary button" value={str("ctaPrimary")} onChange={(v) => set("ctaPrimary", v)} />
        <Field label="Secondary button" value={str("ctaSecondary")} onChange={(v) => set("ctaSecondary", v)} />
        <Field label="Story eyebrow" value={str("storyEyebrow")} onChange={(v) => set("storyEyebrow", v)} />
        <Field label="Story title" value={str("storyTitle")} onChange={(v) => set("storyTitle", v)} />
        <Field label="Story body 1" value={str("storyBody1")} onChange={(v) => set("storyBody1", v)} rows={4} />
        <Field label="Story body 2" value={str("storyBody2")} onChange={(v) => set("storyBody2", v)} rows={3} />
        <Field label="Quote" value={str("quote")} onChange={(v) => set("quote", v)} rows={2} />
        <Field label="Quote by" value={str("quoteBy")} onChange={(v) => set("quoteBy", v)} />
        <p className={adminLabel}>Principles</p>
        <RepeatList
          items={(fields.principles as { index: string; title: string; body: string }[]) ?? []}
          onChange={(principles) => set("principles", principles)}
          create={() => ({ index: "", title: "", body: "" })}
          addLabel="Add principle"
          render={(item, _i, update) => (
            <div className="grid gap-3 pr-8">
              <input className={adminField} placeholder="01" value={item.index} onChange={(e) => update({ ...item, index: e.target.value })} />
              <input className={adminField} value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
              <textarea className={adminField} rows={3} value={item.body} onChange={(e) => update({ ...item, body: e.target.value })} />
            </div>
          )}
        />
        <p className={adminLabel}>Why us</p>
        <RepeatList
          items={(fields.whyUs as { title: string; body: string }[]) ?? []}
          onChange={(whyUs) => set("whyUs", whyUs)}
          create={() => ({ title: "", body: "" })}
          addLabel="Add card"
          render={(item, _i, update) => (
            <div className="grid gap-3 pr-8">
              <input className={adminField} value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
              <textarea className={adminField} rows={2} value={item.body} onChange={(e) => update({ ...item, body: e.target.value })} />
            </div>
          )}
        />
        <Field label="Team eyebrow" value={str("teamEyebrow")} onChange={(v) => set("teamEyebrow", v)} />
        <Field label="Team title" value={str("teamTitle")} onChange={(v) => set("teamTitle", v)} />
        <Field label="Team body" value={str("teamBody")} onChange={(v) => set("teamBody", v)} rows={3} />
        <Field label="Bottom CTA title" value={str("ctaTitle")} onChange={(v) => set("ctaTitle", v)} />
        <Field label="Bottom CTA body" value={str("ctaBody")} onChange={(v) => set("ctaBody", v)} rows={3} />
        <Field label="Bottom CTA button" value={str("ctaButton")} onChange={(v) => set("ctaButton", v)} />
        <StringList label="Bottom CTA bullets" items={(fields.ctaBullets as string[]) ?? []} onChange={(ctaBullets) => set("ctaBullets", ctaBullets)} />
        <p className={adminLabel}>Hero photo labels</p>
        <RepeatList
          items={(fields.heroImages as { src: string; alt: string; label: string }[]) ?? []}
          onChange={(heroImages) => set("heroImages", heroImages)}
          create={() => ({ src: "", alt: "", label: "" })}
          addLabel="Add photo"
          render={(item, index, update) => (
            <div className="grid gap-3 pr-8">
              <CmsImageField
                label={`Photo ${index + 1}`}
                folder="about"
                value={item.src}
                onChange={(src) => {
                  const next = { ...item, src };
                  update(next);
                  const images = ((fields.heroImages as typeof item[]) ?? []).map((current, i) =>
                    i === index ? next : current,
                  );
                  onImage("heroImages", images);
                }}
              />
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
        <StringList label="Hero bullets" items={(fields.bullets as string[]) ?? []} onChange={(bullets) => set("bullets", bullets)} />
        <Field label="Primary button" value={str("ctaPrimary")} onChange={(v) => set("ctaPrimary", v)} />
        <Field label="Secondary button" value={str("ctaSecondary")} onChange={(v) => set("ctaSecondary", v)} />
        {id === "services" ? (
          <>
            <p className={adminLabel}>Hero stats</p>
            <RepeatList
              items={(fields.stats as { value: string; label: string }[]) ?? []}
              onChange={(stats) => set("stats", stats)}
              create={() => ({ value: "", label: "" })}
              addLabel="Add stat"
              render={(item, _i, update) => (
                <div className="grid gap-3 pr-8 sm:grid-cols-2">
                  <input className={adminField} value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} />
                  <input className={adminField} value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} />
                </div>
              )}
            />
            <Field label="Hero main label" value={str("heroMainLabel")} onChange={(v) => set("heroMainLabel", v)} />
            <Field label="Hero side 1 label" value={str("heroSide1Label")} onChange={(v) => set("heroSide1Label", v)} />
            <Field label="Hero side 2 label" value={str("heroSide2Label")} onChange={(v) => set("heroSide2Label", v)} />
            <Field label="Visit photo label" value={str("visitImageLabel")} onChange={(v) => set("visitImageLabel", v)} />
            <Field label="Pathway eyebrow" value={str("pathwayEyebrow")} onChange={(v) => set("pathwayEyebrow", v)} />
            <Field label="Pathway title" value={str("pathwayTitle")} onChange={(v) => set("pathwayTitle", v)} />
            <Field label="Pathway body" value={str("pathwayBody")} onChange={(v) => set("pathwayBody", v)} rows={3} />
            <Field label="Service list eyebrow" value={str("listEyebrow")} onChange={(v) => set("listEyebrow", v)} />
            <Field label="Service list title" value={str("listTitle")} onChange={(v) => set("listTitle", v)} />
            <Field label="Service list body" value={str("listBody")} onChange={(v) => set("listBody", v)} rows={3} />
            <Field label="Visit eyebrow" value={str("visitEyebrow")} onChange={(v) => set("visitEyebrow", v)} />
            <Field label="Visit title" value={str("visitTitle")} onChange={(v) => set("visitTitle", v)} />
            <Field label="Visit body" value={str("visitBody")} onChange={(v) => set("visitBody", v)} rows={3} />
            <Field label="Bottom CTA title" value={str("ctaTitle")} onChange={(v) => set("ctaTitle", v)} />
            <Field label="Bottom CTA body" value={str("ctaBody")} onChange={(v) => set("ctaBody", v)} rows={3} />
            <Field label="Bottom CTA button" value={str("ctaButton")} onChange={(v) => set("ctaButton", v)} />
          </>
        ) : null}
        {id === "clinics" ? (
          <>
            <Field label="Home-visit stat" value={str("homeVisitStat")} onChange={(v) => set("homeVisitStat", v)} />
            <Field label="Hero main label" value={str("heroMainLabel")} onChange={(v) => set("heroMainLabel", v)} />
            <Field label="Hero side 1 label" value={str("heroSide1Label")} onChange={(v) => set("heroSide1Label", v)} />
            <Field label="Hero side 2 label" value={str("heroSide2Label")} onChange={(v) => set("heroSide2Label", v)} />
            <Field label="Perks eyebrow" value={str("perksEyebrow")} onChange={(v) => set("perksEyebrow", v)} />
            <Field label="Perks title" value={str("perksTitle")} onChange={(v) => set("perksTitle", v)} />
            <Field label="Perks body" value={str("perksBody")} onChange={(v) => set("perksBody", v)} rows={3} />
            <Field label="Locator eyebrow" value={str("locatorEyebrow")} onChange={(v) => set("locatorEyebrow", v)} />
            <Field label="Locator title" value={str("locatorTitle")} onChange={(v) => set("locatorTitle", v)} />
            <Field label="Locator body" value={str("locatorBody")} onChange={(v) => set("locatorBody", v)} rows={3} />
            <Field label="Open clinics eyebrow" value={str("openEyebrow")} onChange={(v) => set("openEyebrow", v)} />
            <Field label="Open clinics title" value={str("openTitle")} onChange={(v) => set("openTitle", v)} />
            <Field label="Open clinics body" value={str("openBody")} onChange={(v) => set("openBody", v)} rows={3} />
            <Field label="Hospitals eyebrow" value={str("hospitalEyebrow")} onChange={(v) => set("hospitalEyebrow", v)} />
            <Field label="Hospitals title" value={str("hospitalTitle")} onChange={(v) => set("hospitalTitle", v)} />
            <Field label="Hospitals body" value={str("hospitalBody")} onChange={(v) => set("hospitalBody", v)} rows={3} />
            <Field label="Home visit CTA title" value={str("homeCtaTitle")} onChange={(v) => set("homeCtaTitle", v)} />
            <Field label="Home visit CTA body" value={str("homeCtaBody")} onChange={(v) => set("homeCtaBody", v)} rows={3} />
            <Field label="Home visit CTA button" value={str("homeCtaButton")} onChange={(v) => set("homeCtaButton", v)} />
          </>
        ) : null}
        {id === "hearing-aids" ? (
          <>
            <Field label="Hero image alt" value={str("heroImageAlt")} onChange={(v) => set("heroImageAlt", v)} />
            <Field label="Steps eyebrow" value={str("stepsEyebrow")} onChange={(v) => set("stepsEyebrow", v)} />
            <Field label="Steps title" value={str("stepsTitle")} onChange={(v) => set("stepsTitle", v)} />
            <Field label="Steps body" value={str("stepsBody")} onChange={(v) => set("stepsBody", v)} rows={3} />
            <Field label="Paths eyebrow" value={str("pathsEyebrow")} onChange={(v) => set("pathsEyebrow", v)} />
            <Field label="Paths title" value={str("pathsTitle")} onChange={(v) => set("pathsTitle", v)} />
            <p className={adminLabel}>Starting-point cards</p>
            <RepeatList
              items={(fields.paths as { title: string; body: string; href: string; image: string; wash: string }[]) ?? []}
              onChange={(paths) => set("paths", paths)}
              create={() => ({ title: "", body: "", href: "", image: "", wash: "bg-brand-surface" })}
              addLabel="Add path"
              render={(item, index, update) => (
                <div className="grid gap-3 pr-8">
                  <input className={adminField} value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
                  <textarea className={adminField} rows={3} value={item.body} onChange={(e) => update({ ...item, body: e.target.value })} />
                  <input className={adminField} placeholder="/hearing-aids/features/..." value={item.href} onChange={(e) => update({ ...item, href: e.target.value })} />
                  <CmsImageField
                    label="Card photo"
                    folder="hearing-aids"
                    value={item.image}
                    onChange={(image) => {
                      const next = { ...item, image };
                      update(next);
                      const paths = ((fields.paths as typeof item[]) ?? []).map((current, i) =>
                        i === index ? next : current,
                      );
                      onImage("paths", paths);
                    }}
                  />
                </div>
              )}
            />
          </>
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
        {id === "services" ? (
          <>
            <p className={adminLabel}>Visit steps</p>
            <RepeatList
              items={(fields.steps as { title: string; body: string }[]) ?? []}
              onChange={(steps) => set("steps", steps)}
              create={() => ({ title: "", body: "" })}
              addLabel="Add step"
              render={(item, _i, update) => (
                <div className="grid gap-3 pr-8">
                  <input className={adminField} value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
                  <textarea className={adminField} rows={3} value={item.body} onChange={(e) => update({ ...item, body: e.target.value })} />
                </div>
              )}
            />
          </>
        ) : null}
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
      <p className="mt-1 text-sm text-brand-muted">Same carousel as the homepage. Photos save as soon as you drop them.</p>
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
