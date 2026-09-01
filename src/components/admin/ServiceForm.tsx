"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteService, saveService } from "@/app/admin/site-actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
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

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await saveService({ ...form, id: service?.id, expect: form.expect.filter(Boolean) });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/services");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Services</p>
        <h1 className="mt-2 text-3xl font-bold">{service ? "Edit service" : "New service"}</h1>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-4 rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <label>
          <span className={adminLabel}>Title</span>
          <input className={adminField} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} />
        </label>
        <label>
          <span className={adminLabel}>Short name</span>
          <input className={adminField} value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} />
        </label>
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
        <CmsImageField label="Cover image" folder="services" value={form.image} onChange={(image) => setForm({ ...form, image })} />
        <CmsImageField label="Detail image" folder="services" value={form.detailImage} onChange={(detailImage) => setForm({ ...form, detailImage })} />
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
