"use client";

import { useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import {
  clearGalleryPhoto,
  saveClinicPhotos,
  saveGalleryAlt,
  saveGalleryPhoto,
} from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { adminField, adminLabel } from "@/components/admin/ui";
import { GALLERY_SLOTS, fallbackGalleryPhotos, type GalleryArea, type GalleryPhoto, type SiteImage } from "@/lib/site-media-shared";
import { uploadClinicPhotos, uploadGalleryPhoto } from "@/lib/site-media-client";
import { cn } from "@/lib/utils";
import type { AdminClinicPhotos, AdminSitePhotos } from "@/lib/admin-site-media";

const areaClass: Record<GalleryArea, string> = {
  one: "[grid-area:one]",
  two: "[grid-area:two]",
  three: "[grid-area:three]",
  four: "[grid-area:four]",
  five: "[grid-area:five]",
  six: "[grid-area:six]",
  seven: "[grid-area:seven]",
};

export function SitePhotosManager({ initial }: { initial: AdminSitePhotos }) {
  const [gallery, setGallery] = useState(initial.gallery);
  const [clinics, setClinics] = useState(initial.clinics);
  const [uploading, setUploading] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initial.error ?? null);
  const [pendingClear, setPendingClear] = useState<GalleryArea | null>(null);
  const [clearing, setClearing] = useState(false);

  const busy = Boolean(uploading) || clearing;
  const ready = initial.ready && !initial.error;

  function flash(message: string) {
    setStatus(message);
    window.setTimeout(() => setStatus((current) => (current === message ? null : current)), 2500);
  }

  async function replaceGallerySlot(area: GalleryArea, file: File) {
    if (!ready) return;
    setError(null);
    setUploading(`gallery-${area}`);
    try {
      const slot = GALLERY_SLOTS.find((item) => item.area === area);
      const current = gallery.find((item) => item.area === area);
      const uploaded = await uploadGalleryPhoto(area, file);
      const alt = current?.isPlaceholder === false ? current.alt : (slot?.label ?? "Clinic photo");
      const result = await saveGalleryPhoto({
        area,
        url: uploaded.url,
        alt,
        storagePath: uploaded.path,
      });
      if (!result.ok) throw new Error(result.error);
      setGallery((items) =>
        items.map((item) =>
          item.area === area
            ? {
                area,
                src: uploaded.url,
                alt,
                id: result.id,
                storagePath: uploaded.path,
                isPlaceholder: false,
              }
            : item,
        ),
      );
      flash("Gallery photo saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload that photo.");
    } finally {
      setUploading(null);
    }
  }

  async function onGalleryAltBlur(photo: GalleryPhoto, alt: string) {
    if (!ready || photo.isPlaceholder || photo.alt === alt) return;
    const result = await saveGalleryAlt(photo.area, alt);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setGallery((items) => items.map((item) => (item.area === photo.area ? { ...item, alt } : item)));
    flash("Description saved.");
  }

  async function confirmClearGallery() {
    if (!pendingClear) return;
    setClearing(true);
    setError(null);
    const result = await clearGalleryPhoto(pendingClear);
    setClearing(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const fallback = fallbackGalleryPhotos().find((item) => item.area === pendingClear);
    setGallery((items) =>
      items.map((item) =>
        item.area === pendingClear
          ? {
              area: pendingClear,
              src: fallback?.src ?? item.src,
              alt: fallback?.alt ?? item.alt,
              isPlaceholder: true,
            }
          : item,
      ),
    );
    setPendingClear(null);
    flash("Slot cleared. The placeholder will show until you add a photo.");
  }

  async function persistClinic(slug: string, images: SiteImage[]) {
    const result = await saveClinicPhotos(
      slug,
      images.map((image) => ({ url: image.url, alt: image.alt, storagePath: image.storagePath })),
    );
    if (!result.ok) throw new Error(result.error);
    setClinics((items) => items.map((clinic) => (clinic.slug === slug ? { ...clinic, images } : clinic)));
  }

  async function addClinicPhotos(clinic: AdminClinicPhotos, files: FileList) {
    if (!ready) return;
    setError(null);
    setUploading(`clinic-${clinic.slug}`);
    try {
      const list = Array.from(files);
      const uploaded = await uploadClinicPhotos(clinic.slug, list, clinic.images.length + 1);
      const next: SiteImage[] = [
        ...clinic.images,
        ...uploaded.map((item, index) => ({
          url: item.url,
          alt: `${clinic.name.replace(" Branch", "")} photo ${clinic.images.length + index + 1}`,
          storagePath: item.path,
        })),
      ];
      await persistClinic(clinic.slug, next);
      flash(`${clinic.name.replace(" Branch", "")} photos saved.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload those photos.");
    } finally {
      setUploading(null);
    }
  }

  async function changeClinicPhotos(clinic: AdminClinicPhotos, images: { url: string; alt: string }[]) {
    if (!ready) return;
    const byUrl = new Map(clinic.images.map((image) => [image.url, image]));
    const next: SiteImage[] = images.map((image, index) => {
      const current = byUrl.get(image.url);
      return {
        url: image.url,
        alt: current?.alt || `${clinic.name.replace(" Branch", "")} photo ${index + 1}`,
        storagePath: current?.storagePath ?? "",
        id: current?.id,
      };
    });
    setError(null);
    try {
      await persistClinic(clinic.slug, next);
      flash("Photo order saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update those photos.");
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">CMS</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">Photos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
          Drop photos onto the layout. They convert to WebP and go live on the homepage gallery and
          clinic cards. Until you add a photo, the site keeps the current placeholder.
        </p>
      </div>

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
      ) : null}
      {status ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          {status}
        </p>
      ) : null}
      {!ready ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
          {initial.error ?? "Photo storage is not ready yet."} Apply{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">supabase/migrations/20260901120000_site_media.sql</code>{" "}
          in the Supabase SQL editor, then refresh this page.
        </p>
      ) : null}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-brand-dark">Photo gallery</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Same layout as the website. Click or drop a photo on any tile. First photo on the left is
            the large hero.
          </p>
        </div>
        <div
          className={cn(
            "grid gap-3",
            "grid-cols-2 [grid-template-areas:'one_one'_'two_two'_'three_four'_'five_seven'_'six_six']",
            "[grid-template-rows:minmax(160px,18vw)_minmax(110px,12vw)_minmax(120px,14vw)_minmax(120px,14vw)_minmax(110px,12vw)]",
            "lg:grid-cols-4 lg:[grid-template-areas:'one_three_four_five'_'one_six_six_seven'_'two_six_six_seven']",
            "lg:[grid-template-rows:minmax(140px,16vw)_minmax(110px,12vw)_minmax(140px,16vw)]",
          )}
        >
          {gallery.map((photo) => {
            const meta = GALLERY_SLOTS.find((item) => item.area === photo.area);
            const slotBusy = uploading === `gallery-${photo.area}`;
            const inputId = `gallery-file-${photo.area}`;
            return (
              <div
                key={photo.area}
                className={cn(
                  "group relative min-h-[110px] overflow-hidden rounded-[1.25rem] bg-brand-surface ring-1 ring-black/5",
                  areaClass[photo.area],
                  !ready && "pointer-events-none opacity-70",
                )}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files[0];
                  if (file) void replaceGallerySlot(photo.area, file);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-dark">
                  {photo.isPlaceholder ? "Placeholder" : meta?.label}
                </span>
                {!photo.isPlaceholder ? (
                  <button
                    type="button"
                    className="absolute right-3 top-3 z-10 rounded-full bg-white/95 p-1.5 text-red-600 opacity-0 shadow-sm ring-1 ring-black/5 transition group-hover:opacity-100"
                    onClick={() => setPendingClear(photo.area)}
                    aria-label={`Remove ${meta?.label ?? "photo"}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                <label
                  htmlFor={inputId}
                  className="absolute inset-0 z-0 flex cursor-pointer items-end justify-between gap-2 p-3 text-white"
                >
                  <span>
                    <span className="block text-sm font-semibold">{meta?.label}</span>
                    <span className="block text-[11px] text-white/80">{meta?.hint}</span>
                  </span>
                  {slotBusy ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-5 w-5 opacity-90" />
                  )}
                </label>
                <input
                  id={inputId}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={busy || !ready}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void replaceGallerySlot(photo.area, file);
                  }}
                />
              </div>
            );
          })}
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {gallery
            .filter((photo) => !photo.isPlaceholder)
            .map((photo) => {
              const meta = GALLERY_SLOTS.find((item) => item.area === photo.area);
              return (
                <li key={`alt-${photo.area}`}>
                  <label className={adminLabel} htmlFor={`alt-${photo.area}`}>
                    {meta?.label} — image description
                  </label>
                  <input
                    id={`alt-${photo.area}`}
                    defaultValue={photo.alt}
                    className={adminField}
                    disabled={!ready}
                    onBlur={(event) => void onGalleryAltBlur(photo, event.target.value.trim())}
                  />
                </li>
              );
            })}
        </ul>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-brand-dark">Clinic cards</h2>
          <p className="mt-1 text-sm text-brand-muted">
            First photo is the cover. Drag to reorder. Extra photos show as the small thumbnails on
            each location card.
          </p>
        </div>
        <ul className="grid gap-5 lg:grid-cols-2">
          {clinics.map((clinic) => (
            <li key={clinic.slug} className={cn("rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5", !ready && "pointer-events-none opacity-70")}>
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  {clinic.city}
                </p>
                <h3 className="text-lg font-bold text-brand-dark">{clinic.name.replace(" Branch", "")}</h3>
              </div>
              <ImageDropzone
                images={clinic.images.map((image) => ({ url: image.url, alt: image.alt }))}
                uploading={uploading === `clinic-${clinic.slug}`}
                emptyLabel="Drop JPG, PNG or WebP. The first photo becomes the cover on the homepage and clinics page."
                onUpload={(files) => void addClinicPhotos(clinic, files)}
                onChange={(images) => void changeClinicPhotos(clinic, images)}
              />
            </li>
          ))}
        </ul>
      </section>

      <ConfirmDialog
        open={Boolean(pendingClear)}
        title="Remove this gallery photo?"
        body="The website will show the placeholder graphic in that slot until you add another photo."
        confirmLabel="Remove photo"
        pending={clearing}
        onCancel={() => setPendingClear(null)}
        onConfirm={() => void confirmClearGallery()}
      />
    </div>
  );
}
