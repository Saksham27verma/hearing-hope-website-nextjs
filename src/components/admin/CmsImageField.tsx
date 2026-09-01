"use client";

import { useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { adminLabel } from "@/components/admin/ui";
import { uploadCmsImage } from "@/lib/site-media-client";
import { WEB_IMAGE_ACCEPT } from "@/lib/web-image-client";

export function CmsImageField({
  label,
  value,
  folder,
  hint,
  onChange,
}: {
  label: string;
  value: string;
  folder: string;
  hint?: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadCmsImage(folder, file);
      onChange(uploaded.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="block">
      <span className={adminLabel}>{label}</span>
      <span
        className="mt-1 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-brand-border bg-brand-surface px-3 py-3"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void onFile(event.dataTransfer.files[0]);
        }}
      >
        <span className="relative h-16 w-20 overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-brand-muted">
              <ImagePlus className="h-4 w-4" />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-brand-dark">
            {busy ? "Optimising…" : value ? "Replace image" : "Drop or click to upload"}
          </span>
          {hint ? <span className="mt-0.5 block text-xs text-brand-muted">{hint}</span> : null}
          {error ? <span className="mt-0.5 block text-xs text-red-600">{error}</span> : null}
        </span>
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin text-brand-orange" /> : null}
        <input
          type="file"
          accept={WEB_IMAGE_ACCEPT}
          className="hidden"
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </span>
    </label>
  );
}
