import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageTemplate } from "@/components/content/ContentPageTemplate";
import { contentPagePath, getPublishedContentPage, listPublishedContentPages } from "@/lib/content-pages";
import { site } from "@/lib/site";

type ContentPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const pages = await listPublishedContentPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedContentPage(slug);
  if (!page) return { title: "Page not found" };
  const canonical = page.canonicalUrl || `${site.url}${contentPagePath(page.slug)}`;
  const title = page.metaTitle || page.title;
  const description = page.metaDescription || page.answerSummary || site.description;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "article", title: `${title} | ${site.name}`, description, url: canonical, publishedTime: page.publishedAt ?? undefined, modifiedTime: page.updatedAt },
    robots: { index: true, follow: true },
  };
}

export default async function PublishedContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  const page = await getPublishedContentPage(slug);
  if (!page) notFound();
  return <ContentPageTemplate page={page} />;
}
