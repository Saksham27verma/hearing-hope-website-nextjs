"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { isRenderableImageSrc } from "@/lib/media-src";
import { cn } from "@/lib/utils";

type ImageSlotProps = {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  rounded?: string;
};

export function ImageSlot({
  src,
  alt,
  label,
  className,
  rounded = "rounded-[1.5rem]",
}: ImageSlotProps) {
  const [broken, setBroken] = useState(false);
  const ready = isRenderableImageSrc(src) && !broken;

  useEffect(() => {
    setBroken(false);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", rounded, className)}>
      {ready ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-[#EEF4F8] via-white to-[#F4EDE6] px-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-brand-teal shadow-sm ring-1 ring-black/5">
            <Camera className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-brand-dark">{label ?? "Photograph"}</p>
          <p className="max-w-[14rem] text-xs leading-5 text-brand-muted">Space reserved for a clinic photo</p>
        </div>
      )}
    </div>
  );
}
