"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteService, saveService } from "@/app/admin/site-actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { CmsLayoutSlot } from "@/components/admin/CmsLayoutSlot";
import { RepeatList } from "@/components/admin/RepeatList";
import { adminField, adminLabel } from "@/components/admin/ui";
import type { CmsService } from "@/lib/site-cms/types";
import { slugify } from "@/lib/urls";

const ICONS = ["activity", "ear", "brain", "headphones", "audio-lines", "baby", "radio", "waves", "audio-waveform", "speech"];

export function ServiceForm({ service }: { service?: CmsService }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: service?.title ?? "",
    slug: service?.slug ?? "",
    shortName: service?.shortName ?? "",
    category: service?.category ?? "",
    duration: service?.duration ?? "",
    excerpt: service?.excerpt ?? "",
    image: service?.image ?? "",
    detailImage: service?.detailImage ?? "",
    icon: service?.icon ?? "activity",
    accent: service?.accent ?? "bg-[#FFF4ED] text-brand-orange",
    who: service?.who ?? "",
    what: service?.what ?? "",
    expect: service?.expect ?? [""],
    published: service?.published ?? true,
    sortOrder: service?.sortOrder ?? 1,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function persist(next = form) {
    const result = await saveService({
      ...next,
      id: service?.id,
      expect: next.expect.filter(Boolean),
    });
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setError(null);
    router.refresh();
    return true;
  }

  async function onImage(key: "image" | "detailImage", url: string) {
    const next = { ...form, [key]: url };
    setForm(next);
    if (!service?.id) return;
    const saved = await persist(next);
    if (saved) setStatus("Photo saved — it is live on the service page.");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const saved = await persist();
    setPending(false);
    if (!saved) return;
    router.push("/admin/services");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Services</p>
        <h1 className="mt-2 text-3xl font-bold">{service ? "Edit service" : "New service"}</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Cover photo is the card on /services. Detail photo is the large photo on the service page.
        </p>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {status ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</p> : null}

      <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Page preview</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Same photo slots as the live service pages. Drop a photo onto a tile to replace it.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Services grid card</p>
            <div className="overflow-hidden rounded-[1.75rem] bg-brand-surface ring-1 ring-black/5">
              <CmsLayoutSlot
                folder="services"
                src={form.image}
                label={form.shortName || "Cover"}
                hint="Card cover on /services"
                className="h-44"
                rounded="rounded-none"
                onChange={(url) => void onImage("image", url)}
              />
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">{form.category || "Category"}</p>
                <p className="mt-1 text-lg font-bold text-brand-dark">{form.shortName || "Service name"}</p>
                <p className="mt-2 line-clamp-3 text-sm text-brand-muted">{form.excerpt || "Excerpt shows here."}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Service detail page</p>
            <CmsLayoutSlot
              folder="services"
              src={form.detailImage || form.image}
              label={`${form.shortName || "Service"} in clinic`}
              hint="Large photo on the service page"
              className="min-h-[220px]"
              onChange={(url) => void onImage("detailImage", url)}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <label>
          <span className={adminLabel}>Title</span>
          <input className={adminField} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} />
        </label>
        <label>
          <span className={adminLabel}>Short name</span>
          <input className={adminField} value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className={adminLabel}>Category</span>
            <input className={adminField} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Duration</span>
            <input className={adminField} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </label>
        </div>
        <label>
          <span className={adminLabel}>Excerpt</span>
          <textarea className={adminField} rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Who</span>
          <textarea className={adminField} rows={3} value={form.who} onChange={(e) => setForm({ ...form, who: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>What</span>
          <textarea className={adminField} rows={3} value={form.what} onChange={(e) => setForm({ ...form, what: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Icon</span>
          <select className={adminField} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value as CmsService["icon"] })}>
            {ICONS.map((icon) => (
              <option key={icon}>{icon}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Published
        </label>
        <CmsImageField label="Cover image" folder="services" value={form.image} onChange={(image) => void onImage("image", image)} />
        <CmsImageField label="Detail image" folder="services" value={form.detailImage} onChange={(detailImage) => void onImage("detailImage", detailImage)} />
        <p className={adminLabel}>What to expect</p>
        <RepeatList
          items={form.expect}
          onChange={(expect) => setForm({ ...form, expect })}
          create={() => ""}
          addLabel="Add step"
          render={(item, _i, update) => (
            <textarea className={`${adminField} pr-8`} rows={2} value={item} onChange={(e) => update(e.target.value)} />
          )}
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white">
          {pending ? "Saving…" : "Save service"}
        </button>
        {service?.id ? (
          <button type="button" className="rounded-full px-6 py-3 text-sm font-semibold text-red-600" onClick={async () => { await deleteService(service.id as string); router.push("/admin/services"); }}>
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
