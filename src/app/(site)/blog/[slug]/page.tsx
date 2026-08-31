import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BlogArticleCta } from "@/components/blog/BlogArticleCta";
import { BlogAuthorAvatar } from "@/components/blog/BlogAuthorAvatar";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogToc } from "@/components/blog/BlogToc";
import { LeadForm } from "@/components/sections/LeadForm";
import { SchemaScript } from "@/components/ui/SchemaScript";
import { formatBlogDate, getRelatedBlogs } from "@/data/blogs";
import {
  blogCanonicalPath,
  effectiveMetaDescription,
  effectiveMetaTitle,
  effectiveOgDescription,
  effectiveOgImage,
  effectiveOgTitle,
} from "@/lib/blog-utils";
import { listPublishedPosts, resolveBlogSlug } from "@/lib/blog";
import { articleFaqSchema, blogPostingSchema, breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await resolveBlogSlug(slug);
  if (result.status === "redirect") {
    redirect(`/blog/${result.slug}`);
  }
  if (result.status !== "ok") return { title: "Article" };

  const post = result.post;
  const canonical = `${site.url}${blogCanonicalPath(post)}`;
  const title = effectiveMetaTitle(post);
  const description = effectiveMetaDescription(post);
  const ogTitle = effectiveOgTitle(post);
  const ogDescription = effectiveOgDescription(post);
  const ogImage = effectiveOgImage(post);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: { index: post.robotsIndex, follow: post.robotsFollow },
    openGraph: {
      type: "article",
      title: ogTitle.includes(site.name) ? ogTitle : `${ogTitle} | ${site.name}`,
      description: ogDescription,
      url: canonical,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author.name],
      images: [{ url: ogImage, alt: post.imageAlt || post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle.includes(site.name) ? ogTitle : `${ogTitle} | ${site.name}`,
      description: ogDescription,
      images: [{ url: ogImage, alt: post.imageAlt || post.title }],
    },
  };
}

export default async function BlogArticlePage({ params }: BlogPageProps) {
  const { slug } = await params;
  const result = await resolveBlogSlug(slug);
  if (result.status === "redirect") redirect(`/blog/${result.slug}`);
  if (result.status !== "ok") notFound();

  const post = result.post;
  const posts = await listPublishedPosts();
  const related = getRelatedBlogs(posts, post.slug);
  const url = `/blog/${post.slug}`;
  const faqSchema = articleFaqSchema(post);

  return (
    <main className="bg-brand-surface">
      <SchemaScript id="article-jsonld" data={blogPostingSchema(post)} />
      {faqSchema ? <SchemaScript id="article-faq-jsonld" data={faqSchema} /> : null}
      <SchemaScript
        id="article-breadcrumbs"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: url },
        ])}
      />

      <header className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-brand-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-brand-dark">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="hover:text-brand-dark">
                  Blog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="max-w-[18rem] truncate text-brand-dark sm:max-w-md">{post.title}</li>
            </ol>
          </nav>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            {post.category}
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl lg:text-5xl lg:leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-brand-muted sm:text-lg">{post.excerpt}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <BlogAuthorAvatar author={post.author} />
            <div>
              <p className="text-sm font-semibold text-brand-dark">
                By {post.author.name}
              </p>
              <p className="text-sm text-brand-muted">
                {post.author.role}
                <span aria-hidden="true"> · </span>
                <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                <span aria-hidden="true"> · </span>
                {post.readTime} read
              </p>
            </div>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
        <div className="relative mb-10 overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/5">
          <div className="relative aspect-[16/9] w-full sm:aspect-[2.2/1]">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              priority
              sizes="(min-width: 1280px) 1120px, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5 sm:p-10 lg:hidden">
              <BlogToc sections={post.sections} />
            </div>

            <div className="mt-6 rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5 sm:p-10 lg:mt-0">
              <div className="space-y-10">
                {post.sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28">
                    <h2 className="text-xl font-bold tracking-tight text-brand-dark sm:text-2xl">
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-4 text-base leading-8 text-brand-muted sm:text-lg sm:leading-8">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.list ? (
                      <ul className="mt-5 space-y-3">
                        {section.list.map((item) => (
                          <li key={item} className="flex gap-3 text-base leading-7 text-brand-muted sm:text-[1.05rem]">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
              {post.faqs.length ? (
                <section className="mt-12 border-t border-black/5 pt-10">
                  <h2 className="text-xl font-bold tracking-tight text-brand-dark sm:text-2xl">
                    Frequently asked questions
                  </h2>
                  <dl className="mt-6 space-y-6">
                    {post.faqs.map((faq) => (
                      <div key={faq.question}>
                        <dt className="text-base font-semibold text-brand-dark">{faq.question}</dt>
                        <dd className="mt-2 text-base leading-7 text-brand-muted">{faq.answer}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:col-span-4">
            <div className="hidden rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5 lg:block">
              <BlogToc sections={post.sections} />
            </div>
            <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Book a visit
              </p>
              <h2 className="mt-2 text-xl font-bold text-brand-dark">Book a free hearing test</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Share your name and number. An audiologist will call to confirm a home or clinic slot.
              </p>
              <div className="mt-5">
                <LeadForm />
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <BlogArticleCta />
        </div>

        {related.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-2xl font-bold tracking-tight text-brand-dark">Keep reading</h2>
            <p className="mt-2 text-sm text-brand-muted">Related articles from the Hearing Hope blog.</p>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <BlogCard post={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  );
}
