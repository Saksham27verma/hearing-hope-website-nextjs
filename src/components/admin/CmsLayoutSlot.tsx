"use client";

import { useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { uploadCmsImage } from "@/lib/site-media-client";
import { WEB_IMAGE_ACCEPT } from "@/lib/web-image-client";
import { isRenderableImageSrc } from "@/lib/media-src";
import { cn } from "@/lib/utils";

export function CmsLayoutSlot({
  src,
  label,
  hint,
  folder,
  className,
  rounded = "rounded-[1.25rem]",
  onChange,
}: {
  src: string;
  label: string;
  hint?: string;
  folder: string;
  className?: string;
  rounded?: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = isRenderableImageSrc(src);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadCmsImage(folder, file);
      onChange(uploaded.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload that photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn("group relative min-h-[110px] overflow-hidden bg-brand-surface ring-1 ring-black/5", rounded, className)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void onFile(event.dataTransfer.files[0]);
      }}
    >
      {ready ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-[#EEF4F8] via-white to-[#F4EDE6]" />
      )}
      <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-dark">
        {ready ? label : "Placeholder"}
      </span>
      <label className="absolute inset-0 z-0 flex cursor-pointer items-end justify-between gap-2 p-3 text-white">
        <span>
          <span className="block text-sm font-semibold">{label}</span>
          <span className="block text-[11px] text-white/80">{hint ?? "Drop or click — saved to the live page"}</span>
          {error ? <span className="mt-0.5 block text-[11px] text-red-200">{error}</span> : null}
        </span>
        {busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5 opacity-90" />}
        <input
          type="file"
          accept={WEB_IMAGE_ACCEPT}
          className="hidden"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void onFile(file);
          }}
        />
      </label>
    </div>
  );
}
