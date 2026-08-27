import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import type { BlogAuthor } from "@/types";

function publicFileExists(publicPath: string) {
  return existsSync(join(process.cwd(), "public", publicPath.replace(/^\//, "")));
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type BlogAuthorAvatarProps = {
  author: BlogAuthor;
};

export function BlogAuthorAvatar({ author }: BlogAuthorAvatarProps) {
  const ready = Boolean(author.image && publicFileExists(author.image));

  if (ready && author.image) {
    return (
      <Image
        src={author.image}
        alt={author.name}
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10"
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
