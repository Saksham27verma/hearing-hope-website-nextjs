import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogs, getBlogBySlug } from "@/data/blogs";
import { site } from "@/lib/site";

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogs.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return { title: "Article" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | ${site.name}`,
      description: post.excerpt,
    },
  };
}

export default async function BlogArticlePage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 lg:px-6">
      <Link href="/blog" className="text-sm font-medium text-brand-teal hover:underline">
        ← All articles
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-brand-orange">
        {post.category} · {post.date} · {post.readTime}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
        {post.title}
      </h1>
      <div className="relative mt-8 h-64 overflow-hidden rounded-3xl bg-brand-surface sm:h-80">
        <Image src={post.image} alt="" fill className="object-cover" unoptimized />
      </div>
      <div className="mt-8 space-y-4 text-base leading-7 text-brand-muted">
        {post.content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <Link
        href="/#book-test"
        className="mt-10 inline-flex rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white"
      >
        Book a free hearing test
      </Link>
    </main>
  );
}
