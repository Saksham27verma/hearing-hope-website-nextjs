"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTestimonial, saveTestimonial } from "@/app/admin/site-actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { adminField, adminLabel } from "@/components/admin/ui";
import type { CmsTestimonial } from "@/lib/site-cms/types";

const LAYOUTS = ["teal", "quote", "photo", "spotlight", "orange", "simple", "peach"] as const;

export function ReviewsManager({ items }: { items: CmsTestimonial[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(items);
  const [error, setError] = useState<string | null>(null);

  async function persist(item: CmsTestimonial, index: number) {
    if (!item.name.trim() || !item.quote.trim()) return;
    const result = await saveTestimonial({
      id: item.id,
      name: item.name,
      city: item.city,
      quote: item.quote,
      product: item.product,
      photo: item.photo,
      photoAlt: item.photoAlt,
      layout: item.layout,
      published: item.published,
      sortOrder: index + 1,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRows((current) => current.map((row, i) => (i === index ? { ...item, id: result.id } : row)));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Content</p>
        <h1 className="mt-2 text-3xl font-bold">Reviews</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">Patient quotes on the homepage mosaic. Layout controls which tile style is used.</p>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <ul className="space-y-4">
        {rows.map((item, index) => (
          <li key={item.id ?? `new-${index}`} className="grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-black/5 sm:grid-cols-2">
            <label>
              <span className={adminLabel}>Name</span>
              <input className={adminField} value={item.name} onChange={(e) => setRows((current) => current.map((row, i) => (i === index ? { ...row, name: e.target.value } : row)))} onBlur={() => void persist(rows[index], index)} />
            </label>
            <label>
              <span className={adminLabel}>City / role</span>
              <input className={adminField} value={item.city} onChange={(e) => setRows((current) => current.map((row, i) => (i === index ? { ...row, city: e.target.value } : row)))} onBlur={() => void persist(rows[index], index)} />
            </label>
            <label className="sm:col-span-2">
              <span className={adminLabel}>Quote</span>
              <textarea className={adminField} rows={3} value={item.quote} onChange={(e) => setRows((current) => current.map((row, i) => (i === index ? { ...row, quote: e.target.value } : row)))} onBlur={() => void persist(rows[index], index)} />
            </label>
            <label>
              <span className={adminLabel}>Layout</span>
              <select
                className={adminField}
                value={item.layout}
                onChange={(e) => {
                  const next = { ...rows[index], layout: e.target.value };
                  setRows((current) => current.map((row, i) => (i === index ? next : row)));
                  void persist(next, index);
                }}
              >
                {LAYOUTS.map((layout) => (
                  <option key={layout} value={layout}>
                    {layout}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={adminLabel}>Badge / product</span>
              <input className={adminField} value={item.product} onChange={(e) => setRows((current) => current.map((row, i) => (i === index ? { ...row, product: e.target.value } : row)))} onBlur={() => void persist(rows[index], index)} />
            </label>
            <div className="sm:col-span-2">
              <CmsImageField
                label="Photo (optional)"
                folder="reviews"
                value={item.photo}
                onChange={(photo) => {
                  const next = { ...rows[index], photo };
                  setRows((current) => current.map((row, i) => (i === index ? next : row)));
                  void persist(next, index);
                }}
              />
            </div>
            <button
              type="button"
              className="text-left text-sm font-semibold text-red-600"
              onClick={async () => {
                if (item.id) await deleteTestimonial(item.id);
                setRows((current) => current.filter((_, i) => i !== index));
                router.refresh();
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="text-sm font-semibold text-brand-teal"
        onClick={() =>
          setRows((current) => [
            ...current,
            { name: "", city: "", quote: "", product: "", photo: "", photoAlt: "", layout: "simple", published: true, sortOrder: current.length + 1 },
          ])
        }
      >
        Add review
      </button>
    </div>
  );
}
