"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSiteSettings } from "@/app/admin/site-actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { RepeatList } from "@/components/admin/RepeatList";
import { adminField, adminLabel } from "@/components/admin/ui";
import type { SiteSettings } from "@/lib/site-cms/types";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patch(next: Partial<SiteSettings>) {
    setForm((current) => ({ ...current, ...next }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await saveSiteSettings(form);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatus("Settings saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Website</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Phones, social links, the promo strip, and footer copy used on every public page.
        </p>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {status ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</p> : null}

      <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Contact</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={adminLabel}>Clinic name</span>
            <input className={adminField} value={form.name} onChange={(e) => patch({ name: e.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Tagline</span>
            <input className={adminField} value={form.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
          </label>
          <label className="sm:col-span-2">
            <span className={adminLabel}>SEO description</span>
            <textarea className={adminField} rows={3} value={form.description} onChange={(e) => patch({ description: e.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Main phone (display)</span>
            <input className={adminField} value={form.phoneDisplay} onChange={(e) => patch({ phoneDisplay: e.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Main phone (tel)</span>
            <input className={adminField} value={form.phoneTel} onChange={(e) => patch({ phoneTel: e.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>WhatsApp number</span>
            <input className={adminField} value={form.whatsappNumber} onChange={(e) => patch({ whatsappNumber: e.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Email</span>
            <input className={adminField} value={form.email} onChange={(e) => patch({ email: e.target.value })} />
          </label>
        </div>
        <p className={`${adminLabel} mt-6`}>Extra phones</p>
        <RepeatList
          items={form.extraPhones}
          onChange={(extraPhones) => patch({ extraPhones })}
          create={() => ({ display: "", tel: "" })}
          addLabel="Add phone"
          render={(item, _i, update) => (
            <div className="grid gap-3 pr-8 sm:grid-cols-2">
              <input className={adminField} placeholder="Display" value={item.display} onChange={(e) => update({ ...item, display: e.target.value })} />
              <input className={adminField} placeholder="Tel" value={item.tel} onChange={(e) => update({ ...item, tel: e.target.value })} />
            </div>
          )}
        />
      </section>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Promo strip</h2>
        <div className="mt-4 grid gap-4">
          <label>
            <span className={adminLabel}>Eyebrow</span>
            <input className={adminField} value={form.promo.eyebrow} onChange={(e) => patch({ promo: { ...form.promo, eyebrow: e.target.value } })} />
          </label>
          <label>
            <span className={adminLabel}>Title</span>
            <input className={adminField} value={form.promo.title} onChange={(e) => patch({ promo: { ...form.promo, title: e.target.value } })} />
          </label>
          <label>
            <span className={adminLabel}>Body</span>
            <textarea className={adminField} rows={2} value={form.promo.body} onChange={(e) => patch({ promo: { ...form.promo, body: e.target.value } })} />
          </label>
          <label>
            <span className={adminLabel}>Button label</span>
            <input className={adminField} value={form.promo.cta} onChange={(e) => patch({ promo: { ...form.promo, cta: e.target.value } })} />
          </label>
          <label>
            <span className={adminLabel}>Link</span>
            <input className={adminField} value={form.promo.href} onChange={(e) => patch({ promo: { ...form.promo, href: e.target.value } })} />
          </label>
          <CmsImageField
            label="Promo image"
            folder="promo"
            value={form.promo.image}
            onChange={(image) => patch({ promo: { ...form.promo, image } })}
          />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Footer</h2>
        <div className="mt-4 grid gap-4">
          <label>
            <span className={adminLabel}>Eyebrow</span>
            <input className={adminField} value={form.footer.eyebrow} onChange={(e) => patch({ footer: { ...form.footer, eyebrow: e.target.value } })} />
          </label>
          <label>
            <span className={adminLabel}>Title</span>
            <input className={adminField} value={form.footer.title} onChange={(e) => patch({ footer: { ...form.footer, title: e.target.value } })} />
          </label>
          <label>
            <span className={adminLabel}>Title accent</span>
            <input className={adminField} value={form.footer.titleAccent} onChange={(e) => patch({ footer: { ...form.footer, titleAccent: e.target.value } })} />
          </label>
          <label>
            <span className={adminLabel}>Body</span>
            <textarea className={adminField} rows={2} value={form.footer.body} onChange={(e) => patch({ footer: { ...form.footer, body: e.target.value } })} />
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Social and reviews</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={adminLabel}>Facebook</span>
            <input className={adminField} value={form.social.facebook} onChange={(e) => patch({ social: { ...form.social, facebook: e.target.value } })} />
          </label>
          <label>
            <span className={adminLabel}>Instagram</span>
            <input className={adminField} value={form.social.instagram} onChange={(e) => patch({ social: { ...form.social, instagram: e.target.value } })} />
          </label>
          <label>
            <span className={adminLabel}>YouTube</span>
            <input className={adminField} value={form.social.youtube} onChange={(e) => patch({ social: { ...form.social, youtube: e.target.value } })} />
          </label>
          <label>
            <span className={adminLabel}>Google rating</span>
            <input className={adminField} value={form.googleRating} onChange={(e) => patch({ googleRating: e.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Google review count</span>
            <input className={adminField} value={form.googleReviewCount} onChange={(e) => patch({ googleReviewCount: e.target.value })} />
          </label>
          <label className="sm:col-span-2">
            <span className={adminLabel}>Google reviews URL</span>
            <input className={adminField} value={form.googleReviewsUrl} onChange={(e) => patch({ googleReviewsUrl: e.target.value })} />
          </label>
        </div>
      </section>

      <button type="submit" disabled={pending} className="rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
