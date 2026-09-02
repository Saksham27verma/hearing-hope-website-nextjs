"use client";

import { CmsLayoutSlot } from "@/components/admin/CmsLayoutSlot";
import type { SitePageId } from "@/lib/site-cms/types";

export function PageLayoutPreview({
  id,
  fields,
  onChange,
}: {
  id: SitePageId;
  fields: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  const str = (key: string) => String(fields[key] ?? "");

  if (id === "services" || id === "clinics") {
    const folder = id === "services" ? "services" : "clinics";
    return (
      <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Page preview</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Same photo layout as the live {id} page. Drop a photo onto a tile — it saves immediately.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-rows-[minmax(200px,1fr)_minmax(140px,0.7fr)]">
          <CmsLayoutSlot
            folder={folder}
            src={str("heroMain")}
            label={str("heroMainLabel") || "Hero main"}
            hint="Large hero photo"
            className="col-span-2 min-h-[200px] lg:min-h-[240px]"
            rounded="rounded-[1.75rem]"
            onChange={(url) => onChange("heroMain", url)}
          />
          <CmsLayoutSlot
            folder={folder}
            src={str("heroSide1")}
            label={str("heroSide1Label") || "Hero side 1"}
            className="min-h-[140px]"
            onChange={(url) => onChange("heroSide1", url)}
          />
          <CmsLayoutSlot
            folder={folder}
            src={str("heroSide2")}
            label={str("heroSide2Label") || "Hero side 2"}
            className="min-h-[140px]"
            onChange={(url) => onChange("heroSide2", url)}
          />
        </div>
        {id === "services" ? (
          <div className="mt-4">
            <CmsLayoutSlot
              folder="services"
              src={str("visitImage")}
              label={str("visitImageLabel") || "Typical visit"}
              hint="Photo next to the visit steps"
              className="min-h-[200px]"
              rounded="rounded-[1.5rem]"
              onChange={(url) => onChange("visitImage", url)}
            />
          </div>
        ) : null}
      </section>
    );
  }

  if (id === "about") {
    const images = (fields.heroImages as { src: string; alt: string; label: string }[]) ?? [];
    return (
      <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Page preview</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Same mosaic as the About hero. Drop a photo onto a tile — it saves immediately.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {images.map((image, index) => (
            <CmsLayoutSlot
              key={`${image.label}-${index}`}
              folder="about"
              src={image.src}
              label={image.label || `Photo ${index + 1}`}
              className={index === 0 ? "col-span-2 min-h-[200px]" : "min-h-[140px]"}
              rounded={index === 0 ? "rounded-[2rem]" : "rounded-[1.5rem]"}
              onChange={(src) =>
                onChange(
                  "heroImages",
                  images.map((item, i) => (i === index ? { ...item, src } : item)),
                )
              }
            />
          ))}
        </div>
      </section>
    );
  }

  if (id === "hearing-aids") {
    return (
      <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <h2 className="text-lg font-bold">Page preview</h2>
        <p className="mt-1 text-sm text-brand-muted">Hero photo as it appears on the hearing-aids page.</p>
        <div className="mt-6">
          <CmsLayoutSlot
            folder="hearing-aids"
            src={str("heroImage")}
            label="Hero image"
            className="min-h-[240px]"
            rounded="rounded-[2rem]"
            onChange={(url) => onChange("heroImage", url)}
          />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Starting-point photos</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {((fields.paths as { title: string; image: string }[]) ?? []).map((path, index) => (
            <li key={`${path.title}-${index}`}>
              <CmsLayoutSlot
                folder="hearing-aids"
                src={path.image}
                label={path.title || `Path ${index + 1}`}
                className="min-h-[160px]"
                onChange={(image) =>
                  onChange(
                    "paths",
                    ((fields.paths as Record<string, unknown>[]) ?? []).map((item, i) =>
                      i === index ? { ...item, image } : item,
                    ),
                  )
                }
              />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return null;
}
