"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveStylePage } from "@/app/admin/site-actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { RepeatList } from "@/components/admin/RepeatList";
import { adminField, adminLabel } from "@/components/admin/ui";
import type { CmsStylePage } from "@/lib/site-cms/types";

export function StylePageForm({ page }: { page: CmsStylePage }) {
  const router = useRouter();
  const [form, setForm] = useState(page);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await saveStylePage({
      id: form.id,
      name: form.name,
      shortName: form.shortName,
      description: form.description,
      headline: form.headline,
      tagline: form.tagline,
      intro: form.intro,
      facts: form.facts,
      points: form.points,
      highlights: form.highlights,
      image: form.image,
      wash: form.wash,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatus("Saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Types</p>
        <h1 className="mt-2 text-3xl font-bold">{form.shortName} landing page</h1>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {status ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</p> : null}
      <div className="grid gap-4 rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <label>
          <span className={adminLabel}>Name</span>
          <input className={adminField} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Short name</span>
          <input className={adminField} value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Headline</span>
          <input className={adminField} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Tagline</span>
          <input className={adminField} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Intro</span>
          <textarea className={adminField} rows={4} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Description</span>
          <textarea className={adminField} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <CmsImageField label="Hero image" folder="types" value={form.image} onChange={(image) => setForm({ ...form, image })} />
        <div className="overflow-hidden rounded-[1.75rem] bg-brand-surface p-6 ring-1 ring-black/5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Landing preview</p>
          {form.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image} alt="" className="mx-auto mt-4 h-36 w-auto object-contain" />
          ) : (
            <p className="mt-4 text-sm text-brand-muted">Drop a photo above to see it here.</p>
          )}
        </div>
        <p className={adminLabel}>Facts</p>
        <RepeatList
          items={form.facts}
          onChange={(facts) => setForm({ ...form, facts })}
          create={() => ({ label: "", value: "" })}
          addLabel="Add fact"
          render={(item, _i, update) => (
            <div className="grid gap-3 pr-8 sm:grid-cols-2">
              <input className={adminField} placeholder="Label" value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} />
              <input className={adminField} placeholder="Value" value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} />
            </div>
          )}
        />
        <p className={adminLabel}>Points</p>
        <RepeatList
          items={form.points}
          onChange={(points) => setForm({ ...form, points })}
          create={() => ({ title: "", body: "" })}
          addLabel="Add point"
          render={(item, _i, update) => (
            <div className="grid gap-3 pr-8">
              <input className={adminField} value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
              <textarea className={adminField} rows={3} value={item.body} onChange={(e) => update({ ...item, body: e.target.value })} />
            </div>
          )}
        />
        <p className={adminLabel}>Highlights</p>
        <RepeatList
          items={form.highlights}
          onChange={(highlights) => setForm({ ...form, highlights })}
          create={() => ""}
          addLabel="Add highlight"
          render={(item, _i, update) => <input className={`${adminField} pr-8`} value={item} onChange={(e) => update(e.target.value)} />}
        />
      </div>
      <button type="submit" disabled={pending} className="rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white">
        {pending ? "Saving…" : "Save type page"}
      </button>
    </form>
  );
}
