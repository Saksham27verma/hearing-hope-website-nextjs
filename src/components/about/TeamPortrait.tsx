import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { cn } from "@/lib/utils";

function publicFileExists(publicPath: string) {
  return existsSync(join(process.cwd(), "public", publicPath.replace(/^\//, "")));
}

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
  const ready = publicFileExists(src);
  const wash =
    accent === "teal"
      ? "from-[#18AD8D]/25 via-[#F8FAFC] to-[#FFF4ED]"
      : accent === "dark"
        ? "from-[#0F172A]/20 via-[#EEF4F8] to-[#F4EDE6]"
        : "from-[#FF6503]/20 via-[#FFF7F0] to-[#E7F7F3]";

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", rounded, className)}>
      {ready ? (
        <Image
          src={src}
          alt={`${name}, Hearing Hope`}
          fill
          className="object-cover object-top"
          sizes="(min-width: 1024px) 30vw, 80vw"
          unoptimized
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
