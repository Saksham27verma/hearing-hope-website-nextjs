import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatBlogDate } from "@/data/blogs";
import type { BlogPost } from "@/types";

type BlogCardProps = {
  post: BlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.4)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(255,101,3,0.28)]">
      <Link href={`/blog/${post.slug}`} className="relative block h-48 overflow-hidden bg-brand-surface">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-brand-teal">
          {post.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold leading-snug text-brand-dark">
          <Link href={`/blog/${post.slug}`} className="hover:text-brand-orange">
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-brand-muted">{post.excerpt}</p>
        <p className="mt-4 text-xs text-brand-muted">
          By <span className="font-semibold text-brand-dark">{post.author.name}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
          <span aria-hidden="true"> · </span>
          {post.readTime} read
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange hover:underline"
        >
          Read article
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
