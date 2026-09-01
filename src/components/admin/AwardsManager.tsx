"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAward, deleteHospital, saveAward, saveHospital } from "@/app/admin/site-actions";
import { CmsImageField } from "@/components/admin/CmsImageField";
import { adminField, adminLabel } from "@/components/admin/ui";
import type { CmsAward, CmsHospital } from "@/lib/site-cms/types";

export function AwardsManager({
  awards,
  hospitals,
}: {
  awards: CmsAward[];
  hospitals: CmsHospital[];
}) {
  const router = useRouter();
  const [awardRows, setAwardRows] = useState(awards);
  const [hospitalRows, setHospitalRows] = useState(hospitals);
  const [error, setError] = useState<string | null>(null);

  async function persistAward(item: CmsAward, index: number) {
    if (!item.src.trim()) return;
    const result = await saveAward({
      id: item.id,
      src: item.src,
      alt: item.alt,
      label: item.label,
      published: item.published,
      sortOrder: index + 1,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAwardRows((current) => current.map((row, i) => (i === index ? { ...item, id: result.id } : row)));
    router.refresh();
  }

  async function persistHospital(item: CmsHospital, index: number) {
    if (!item.name.trim()) return;
    const result = await saveHospital({
      id: item.id,
      name: item.name,
      location: item.location,
      logo: item.logo,
      url: item.url,
      focus: item.focus,
      published: item.published,
      sortOrder: index + 1,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setHospitalRows((current) => current.map((row, i) => (i === index ? { ...item, id: result.id } : row)));
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Content</p>
        <h1 className="mt-2 text-3xl font-bold">Awards and partners</h1>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Awards</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {awardRows.map((item, index) => (
            <li key={item.id ?? `award-${index}`} className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
              <CmsImageField
                label="Certificate"
                folder="awards"
                value={item.src}
                onChange={(src) => {
                  const next = { ...awardRows[index], src };
                  setAwardRows((current) => current.map((row, i) => (i === index ? next : row)));
                  void persistAward(next, index);
                }}
              />
              <label className="mt-3 block">
                <span className={adminLabel}>Label</span>
                <input className={adminField} value={item.label} onChange={(e) => setAwardRows((current) => current.map((row, i) => (i === index ? { ...row, label: e.target.value } : row)))} onBlur={() => void persistAward(awardRows[index], index)} />
              </label>
              <button type="button" className="mt-3 text-sm font-semibold text-red-600" onClick={async () => { if (item.id) await deleteAward(item.id); setAwardRows((current) => current.filter((_, i) => i !== index)); router.refresh(); }}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="text-sm font-semibold text-brand-teal" onClick={() => setAwardRows((current) => [...current, { src: "", alt: "", label: "", published: true, sortOrder: current.length + 1 }])}>
          Add award
        </button>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Hospital partners</h2>
        <ul className="space-y-4">
          {hospitalRows.map((item, index) => (
            <li key={item.id ?? `hospital-${index}`} className="grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-black/5 sm:grid-cols-2">
              <label>
                <span className={adminLabel}>Name</span>
                <input className={adminField} value={item.name} onChange={(e) => setHospitalRows((current) => current.map((row, i) => (i === index ? { ...row, name: e.target.value } : row)))} onBlur={() => void persistHospital(hospitalRows[index], index)} />
              </label>
              <label>
                <span className={adminLabel}>Location</span>
                <input className={adminField} value={item.location} onChange={(e) => setHospitalRows((current) => current.map((row, i) => (i === index ? { ...row, location: e.target.value } : row)))} onBlur={() => void persistHospital(hospitalRows[index], index)} />
              </label>
              <label className="sm:col-span-2">
                <span className={adminLabel}>Link</span>
                <input className={adminField} value={item.url} onChange={(e) => setHospitalRows((current) => current.map((row, i) => (i === index ? { ...row, url: e.target.value } : row)))} onBlur={() => void persistHospital(hospitalRows[index], index)} />
              </label>
              <div className="sm:col-span-2">
                <CmsImageField
                  label="Logo"
                  folder="hospitals"
                  value={item.logo}
                  onChange={(logo) => {
                    const next = { ...hospitalRows[index], logo };
                    setHospitalRows((current) => current.map((row, i) => (i === index ? next : row)));
                    void persistHospital(next, index);
                  }}
                />
              </div>
              <button type="button" className="text-left text-sm font-semibold text-red-600" onClick={async () => { if (item.id) await deleteHospital(item.id); setHospitalRows((current) => current.filter((_, i) => i !== index)); router.refresh(); }}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="text-sm font-semibold text-brand-teal" onClick={() => setHospitalRows((current) => [...current, { name: "", location: "", logo: "", url: "", focus: "", published: true, sortOrder: current.length + 1 }])}>
          Add hospital
        </button>
      </section>
    </div>
  );
}
