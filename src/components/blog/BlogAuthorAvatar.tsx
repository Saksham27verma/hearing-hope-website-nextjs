"use client";

import { useEffect, useState } from "react";
import { isRenderableImageSrc } from "@/lib/media-src";
import type { BlogAuthor } from "@/types";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function BlogAuthorAvatar({ author }: { author: BlogAuthor }) {
  const [broken, setBroken] = useState(false);
  const ready = isRenderableImageSrc(author.image) && !broken;

  useEffect(() => {
    setBroken(false);
  }, [author.image]);

  if (ready && author.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={author.image}
        alt={author.name}
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/15 text-sm font-bold text-brand-teal ring-1 ring-brand-teal/20"
    >
      {initialsFromName(author.name)}
    </span>
  );
}
