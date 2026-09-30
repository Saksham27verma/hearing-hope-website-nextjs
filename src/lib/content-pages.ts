import { cache } from "react";
import { unstable_cache } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createServiceSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/service";

export const CONTENT_PAGES_TAG = "content-pages";
export const CONTENT_PAGE_TYPES = ["clinic", "product", "test", "condition", "guide", "comparison", "blog", "landing"] as const;
export type ContentPageType = (typeof CONTENT_PAGE_TYPES)[number];

export type ContentFaq = { question: string; answer: string };
export type ContentSource = { name?: string; url?: string; title?: string };
export type PublishedContentPage = {
  id: string;
  slug: string;
  pageType: ContentPageType;
  title: string;
  bodyMarkdown: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  answerSummary: string;
  faqItems: ContentFaq[];
  jsonLd: Record<string, unknown> | Record<string, unknown>[];
  sources: ContentSource[];
  internalLinks: string[];
  reviewedById: string | null;
  reviewerName: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

type ContentPageRow = {
  id: string;
  slug: string;
  page_type: ContentPageType;
  title: string;
  body_markdown: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  answer_summary: string;
  faq_items: unknown;
  json_ld: unknown;
  sources: unknown;
  internal_links: unknown;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  updated_at: string;
};

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")) : [];
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function objectOrArray(value: unknown): Record<string, unknown> | Record<string, unknown>[] {
  if (Array.isArray(value)) return records(value);
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function mapRow(row: ContentPageRow, reviewerNames: Map<string, string>): PublishedContentPage {
  return {
    id: row.id,
    slug: row.slug,
    pageType: row.page_type,
    title: row.title,
    bodyMarkdown: row.body_markdown,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    canonicalUrl: row.canonical_url,
    answerSummary: row.answer_summary,
    faqItems: records(row.faq_items)
      .filter((item) => typeof item.question === "string" && typeof item.answer === "string")
      .map((item) => ({ question: String(item.question), answer: String(item.answer) })),
    jsonLd: objectOrArray(row.json_ld),
    sources: records(row.sources).map((item) => ({ name: stringValue(item.name), url: stringValue(item.url), title: stringValue(item.title) })),
    internalLinks: strings(row.internal_links),
    reviewedById: row.reviewed_by_id,
    reviewerName: row.reviewed_by_id ? reviewerNames.get(row.reviewed_by_id) ?? null : null,
    reviewedAt: row.reviewed_at,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

async function loadPublishedContentPages(): Promise<PublishedContentPage[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = isServiceRoleConfigured() ? createServiceSupabaseClient() : createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select("id, slug, page_type, title, body_markdown, meta_title, meta_description, canonical_url, answer_summary, faq_items, json_ld, sources, internal_links, reviewed_by_id, reviewed_at, published_at, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) {
    console.error("Failed to load published automation content", error.message);
    return [];
  }
  const rows = (data ?? []) as ContentPageRow[];
  const reviewerIds = [...new Set(rows.map((row) => row.reviewed_by_id).filter((id): id is string => Boolean(id)))];
  const reviewerNames = new Map<string, string>();
  if (reviewerIds.length && isServiceRoleConfigured()) {
    const { data: reviewers, error: reviewerError } = await createServiceSupabaseClient().from("team_members").select("id, name").in("id", reviewerIds);
    if (reviewerError) console.error("Failed to load content reviewers", reviewerError.message);
    for (const reviewer of reviewers ?? []) reviewerNames.set(String(reviewer.id), String(reviewer.name));
  }
  return rows.map((row) => mapRow(row, reviewerNames));
}

const cachedPublishedContentPages = unstable_cache(loadPublishedContentPages, ["published-content-pages"], {
  tags: [CONTENT_PAGES_TAG],
});

export const listPublishedContentPages = cache(async () => cachedPublishedContentPages());

export const getPublishedContentPage = cache(async (slug: string) => {
  const pages = await listPublishedContentPages();
  return pages.find((page) => page.slug === slug) ?? null;
});

export function contentPagePath(slug: string) {
  return `/${encodeURIComponent(slug)}`;
}

export function isReviewedMedicalPage(page: Pick<PublishedContentPage, "pageType" | "reviewedById" | "reviewerName" | "reviewedAt">) {
  return ["test", "condition", "product"].includes(page.pageType) && Boolean(page.reviewedById && page.reviewerName && page.reviewedAt);
}
