import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data/blogs";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Hearing Care Journal",
    description:
      "Guides on hearing tests, hearing aid types, prices in India, and caring for family members with hearing loss.",
    openGraph: {
      title: `Hearing Care Journal | ${site.name}`,
      description: "Practical hearing-care articles from Hearing Hope audiologists.",
    },
  };
}

export default async function BlogIndexPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Journal</p>
      <h1 className="mt-2 text-3xl font-bold text-brand-dark">Hearing care articles</h1>
      <p className="mt-3 max-w-2xl text-brand-muted">
        Replace these starter posts with your own writing anytime — the layout stays the same.
      </p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((post) => (
          <li key={post.slug}>
            <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-brand-border">
              <Link href={`/blog/${post.slug}`} className="relative block h-44 bg-brand-surface">
                <Image
                  src={post.image}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-medium text-brand-teal">{post.category}</p>
                <h2 className="mt-2 text-lg font-bold text-brand-dark">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mt-2 flex-1 text-sm text-brand-muted">{post.excerpt}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
