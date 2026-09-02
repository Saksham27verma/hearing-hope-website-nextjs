"use client";

import { useEffect, useState } from "react";
import { isRenderableImageSrc } from "@/lib/media-src";
import { cn } from "@/lib/utils";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type TeamPortraitProps = {
  src: string;
  name: string;
  className?: string;
  rounded?: string;
  accent?: "orange" | "teal" | "dark";
};

export function TeamPortrait({
  src,
  name,
  className,
  rounded = "rounded-[1.5rem]",
  accent = "orange",
}: TeamPortraitProps) {
  const [broken, setBroken] = useState(false);
  const ready = isRenderableImageSrc(src) && !broken;
  const wash =
    accent === "teal"
      ? "from-[#18AD8D]/25 via-[#F8FAFC] to-[#FFF4ED]"
      : accent === "dark"
        ? "from-[#0F172A]/20 via-[#EEF4F8] to-[#F4EDE6]"
        : "from-[#FF6503]/20 via-[#FFF7F0] to-[#E7F7F3]";

  useEffect(() => {
    setBroken(false);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", rounded, className)}>
      {ready ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${name}, Hearing Hope`}
          className="absolute inset-0 h-full w-full object-cover object-top"
          onError={() => setBroken(true)}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br px-4 text-center",
            wash,
          )}
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 text-xl font-bold tracking-wide text-brand-dark shadow-sm ring-1 ring-black/5 sm:h-24 sm:w-24 sm:text-2xl">
            {initialsFromName(name)}
          </span>
          <p className="mt-4 text-sm font-semibold text-brand-dark">{name}</p>
          <p className="mt-1 text-[11px] text-brand-muted">Portrait coming soon</p>
        </div>
      )}
    </div>
  );
}
