import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

function publicFileExists(publicPath: string) {
  return existsSync(join(process.cwd(), "public", publicPath.replace(/^\//, "")));
}

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
  const ready = publicFileExists(src);

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", rounded, className)}>
      {ready ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" unoptimized />
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
