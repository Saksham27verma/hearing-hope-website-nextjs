"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClinic, saveClinic } from "@/app/admin/site-actions";
import { adminField, adminLabel } from "@/components/admin/ui";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { saveClinicPhotos } from "@/app/admin/actions";
import { uploadClinicPhotos } from "@/lib/site-media-client";
import type { CmsClinic } from "@/lib/site-cms/types";
import type { SiteImage } from "@/lib/site-media-shared";
import { slugify } from "@/lib/urls";

export function ClinicForm({
  clinic,
  images,
}: {
  clinic?: CmsClinic;
  images: SiteImage[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: clinic?.name ?? "",
    slug: clinic?.slug ?? "",
    city: clinic?.city ?? "",
    certification: clinic?.certification ?? "",
    address: clinic?.address ?? "",
    phoneDisplay: clinic?.phoneDisplay ?? "",
    phoneTel: clinic?.phoneTel ?? "",
    hours: clinic?.hours ?? "",
    lat: clinic?.lat ?? 0,
    lng: clinic?.lng ?? 0,
    blurb: clinic?.blurb ?? "",
    comingSoon: Boolean(clinic?.comingSoon),
    published: clinic?.published ?? true,
    sortOrder: clinic?.sortOrder ?? 1,
  });
  const [photos, setPhotos] = useState(images);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await saveClinic({ ...form, id: clinic?.id });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (photos.length) {
      await saveClinicPhotos(
        form.slug || slugify(form.name),
        photos.map((image) => ({ url: image.url, alt: image.alt, storagePath: image.storagePath })),
      );
    }
    router.push("/admin/clinics");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Clinics</p>
        <h1 className="mt-2 text-3xl font-bold">{clinic ? "Edit clinic" : "New clinic"}</h1>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-4 rounded-3xl bg-white p-6 ring-1 ring-black/5 sm:grid-cols-2">
        <label>
          <span className={adminLabel}>Name</span>
          <input className={adminField} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
        </label>
        <label>
          <span className={adminLabel}>Slug</span>
          <input className={adminField} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>City</span>
          <input className={adminField} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Certification</span>
          <input className={adminField} value={form.certification} onChange={(e) => setForm({ ...form, certification: e.target.value })} />
        </label>
        <label className="sm:col-span-2">
          <span className={adminLabel}>Address</span>
          <textarea className={adminField} rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <label className="sm:col-span-2">
          <span className={adminLabel}>Blurb</span>
          <textarea className={adminField} rows={3} value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Phone display</span>
          <input className={adminField} value={form.phoneDisplay} onChange={(e) => setForm({ ...form, phoneDisplay: e.target.value })} />
        </label>
        <label>
          <span className={adminLabel}>Hours</span>
          <input className={adminField} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.comingSoon} onChange={(e) => setForm({ ...form, comingSoon: e.target.checked })} />
          Coming soon
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Published
        </label>
      </div>
      <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Photos</h2>
        <div className="mt-4">
          <ImageDropzone
            images={photos.map((image) => ({ url: image.url, alt: image.alt }))}
            uploading={uploading}
            emptyLabel="Clinic cover and extra photos. First image is the card cover."
            onUpload={async (files) => {
              setUploading(true);
              const uploaded = await uploadClinicPhotos(form.slug || "clinic", Array.from(files), photos.length + 1);
              setPhotos((current) => [
                ...current,
                ...uploaded.map((item) => ({ url: item.url, alt: form.name, storagePath: item.path })),
              ]);
              setUploading(false);
            }}
            onChange={(next) => {
              const byUrl = new Map(photos.map((image) => [image.url, image]));
              setPhotos(next.map((image) => byUrl.get(image.url) ?? { url: image.url, alt: image.alt, storagePath: "" }));
            }}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white">
          {pending ? "Saving…" : "Save clinic"}
        </button>
        {clinic?.id ? (
          <button
            type="button"
            className="rounded-full px-6 py-3 text-sm font-semibold text-red-600"
            onClick={async () => {
              await deleteClinic(clinic.id as string);
              router.push("/admin/clinics");
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
