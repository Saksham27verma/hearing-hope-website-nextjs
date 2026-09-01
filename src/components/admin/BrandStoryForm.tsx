"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveBrandStory } from "@/app/admin/site-actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { RepeatList } from "@/components/admin/RepeatList";
import { adminField, adminLabel } from "@/components/admin/ui";
import type { CmsBrandProfile } from "@/lib/site-cms/types";

export function BrandStoryForm({ brand }: { brand: CmsBrandProfile }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: String(brand.name),
    slug: brand.slug,
    logoUrl: brand.logo,
    sortOrder: brand.sortOrder,
    tagline: brand.tagline,
    country: brand.country,
    founded: brand.founded,
    headquarters: brand.headquarters,
    parent: brand.parent,
    intro: brand.intro,
    story: brand.story,
    technologies: brand.technologies,
    highlights: brand.highlights,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!brand.id) {
      setError("This brand is not in the catalog yet. Add it on the Brands list first.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await saveBrandStory({
      id: brand.id,
      ...form,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatus("Brand story saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Brands</p>
        <h1 className="mt-2 text-3xl font-bold">{form.name} story</h1>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {status ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</p> : null}
      <div className="grid gap-4 rounded-3xl bg-white p-6 ring-1 ring-black/5 sm:grid-cols-2">
        <label>
          <span className={adminLabel}>Name</span>
          <input className={adminField} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Slug</span>
          <input className={adminField} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Tagline</span>
          <input className={adminField} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Country</span>
          <input className={adminField} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Founded</span>
          <input className={adminField} value={form.founded} onChange={(e) => setForm({ ...form, founded: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Headquarters</span>
          <input className={adminField} value={form.headquarters} onChange={(e) => setForm({ ...form, headquarters: e.target.value })} />
        </label>
        <label className="sm:col-span-2">
          <span className={adminLabel}>Parent company</span>
          <input className={adminField} value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} />
        </label>
        <label className="sm:col-span-2">
          <span className={adminLabel}>Intro</span>
          <textarea className={adminField} rows={4} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} />
        </label>
        <div className="sm:col-span-2">
          <CmsImageField label="Logo" folder="brands" value={form.logoUrl} onChange={(logoUrl) => setForm({ ...form, logoUrl })} />
        </div>
        <div className="sm:col-span-2">
          <p className={adminLabel}>Story paragraphs</p>
          <RepeatList
            items={form.story}
            onChange={(story) => setForm({ ...form, story })}
            create={() => ""}
            addLabel="Add paragraph"
            render={(item, _i, update) => <textarea className={`${adminField} pr-8`} rows={3} value={item} onChange={(e) => update(e.target.value)} />}
          />
        </div>
        <div className="sm:col-span-2">
          <p className={adminLabel}>Technologies</p>
          <RepeatList
            items={form.technologies}
            onChange={(technologies) => setForm({ ...form, technologies })}
            create={() => ({ title: "", body: "" })}
            addLabel="Add technology"
            render={(item, _i, update) => (
              <div className="grid gap-3 pr-8">
                <input className={adminField} value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
                <textarea className={adminField} rows={3} value={item.body} onChange={(e) => update({ ...item, body: e.target.value })} />
              </div>
            )}
          />
        </div>
        <div className="sm:col-span-2">
          <p className={adminLabel}>Highlights</p>
          <RepeatList
            items={form.highlights}
            onChange={(highlights) => setForm({ ...form, highlights })}
            create={() => ""}
            addLabel="Add highlight"
            render={(item, _i, update) => <input className={`${adminField} pr-8`} value={item} onChange={(e) => update(e.target.value)} />}
          />
        </div>
      </div>
      <button type="submit" disabled={pending} className="rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white">
        {pending ? "Saving…" : "Save brand story"}
      </button>
    </form>
  );
}
