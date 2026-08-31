import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { SchemaScript } from "@/components/ui/SchemaScript";
import { BLOGS_PER_PAGE, blogIndexHref, paginateBlogs, searchBlogs } from "@/data/blogs";
import { listPublishedPosts } from "@/lib/blog";
import { blogIndexSchema, blogItemListSchema, breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";

type BlogIndexPageProps = {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
};

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({ searchParams }: BlogIndexPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const requestedPage = parsePage(first(params.page));
  const posts = await listPublishedPosts();
  const filtered = searchBlogs(posts, q);
  const { page, pageCount } = paginateBlogs(filtered, requestedPage);

  const title =
    q && page > 1
      ? `Search “${q}” — page ${page}`
      : q
        ? `Search “${q}”`
        : page > 1
          ? `Hearing care blog — page ${page}`
          : "Hearing care blog";
  const description =
    "Guides on hearing tests, hearing aid types, prices in India, and caring for family members with hearing loss — written by Hearing Hope audiologists.";
  const canonicalPath = q ? "/blog" : blogIndexHref({ page });
  const other: Record<string, string> = {};
  if (!q && page > 1) other.prev = `${site.url}${blogIndexHref({ page: page - 1 })}`;
  if (!q && page < pageCount) other.next = `${site.url}${blogIndexHref({ page: page + 1 })}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${site.url}${canonicalPath}`,
    },
    robots: q ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: `${site.url}${canonicalPath}`,
      type: "website",
      images: [{ url: "/images/blog/signs-hearing-test.svg", alt: "Hearing Hope blog" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
    },
    ...(Object.keys(other).length ? { other } : {}),
  };
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const requestedPage = parsePage(first(params.page));
  const allPosts = await listPublishedPosts();
  const filtered = searchBlogs(allPosts, q);
  const { posts, page, pageCount, total } = paginateBlogs(filtered, requestedPage);

  return (
    <main className="bg-brand-surface">
      <SchemaScript id="blog-breadcrumbs" data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
      ])} />
      {!q ? (
        <>
          <SchemaScript id="blog-collection" data={blogIndexSchema(filtered)} />
          <SchemaScript id="blog-item-list" data={blogItemListSchema(posts, page, BLOGS_PER_PAGE)} />
        </>
      ) : null}

      <header className="relative overflow-hidden bg-[#07111F] text-white">
        <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Blog</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Hearing care, explained simply
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Practical articles from Hearing Hope audiologists on tests, device types, prices in India,
            and supporting family members with hearing loss.
          </p>
          <div className="mt-8">
            <BlogSearch defaultValue={q} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        {q ? (
          <p className="mb-8 text-sm text-brand-muted">
            {total === 0
              ? `No articles match “${q}”.`
              : `${total} ${total === 1 ? "article" : "articles"} matching “${q}”.`}
            {" "}
            <Link href="/blog" className="font-semibold text-brand-teal hover:underline">
              Clear search
            </Link>
          </p>
        ) : (
          <p className="mb-8 text-sm text-brand-muted">
            {total} articles · Page {page} of {pageCount}
          </p>
        )}

        {posts.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-[1.75rem] bg-white px-6 py-16 text-center ring-1 ring-black/5">
            <p className="text-lg font-semibold text-brand-dark">No matching articles</p>
            <p className="mt-2 text-sm text-brand-muted">
              Try a different keyword, or browse the full blog.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white hover:brightness-105"
            >
              View all articles
            </Link>
          </div>
        )}

        <BlogPagination page={page} pageCount={pageCount} q={q} />
      </section>
    </main>
  );
}
