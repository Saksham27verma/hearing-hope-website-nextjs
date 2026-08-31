import { slugify } from "@/lib/urls";
import type { BlogFaq, BlogPost, BlogSection } from "@/types";

export function asBlogSections(value: unknown): BlogSection[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const heading = String(row.heading ?? "").trim();
    if (!heading) return [];
    const paragraphs = Array.isArray(row.paragraphs)
      ? row.paragraphs.map((paragraph) => String(paragraph).trim()).filter(Boolean)
      : [];
    const list = Array.isArray(row.list)
      ? row.list.map((entry) => String(entry).trim()).filter(Boolean)
      : [];
    return [
      {
        id: String(row.id ?? "").trim() || `${slugify(heading) || "section"}-${index + 1}`,
        heading,
        paragraphs,
        ...(list.length ? { list } : {}),
      },
    ];
  });
}

export function asBlogFaqs(value: unknown): BlogFaq[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const question = String(row.question ?? "").trim();
    const answer = String(row.answer ?? "").trim();
    if (!question || !answer) return [];
    return [{ question, answer }];
  });
}

export function blogWordCount(post: { sections: BlogSection[]; faqs?: BlogFaq[]; excerpt?: string }) {
  const words = [
    post.excerpt ?? "",
    ...post.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.list ?? [])]),
    ...(post.faqs ?? []).flatMap((faq) => [faq.question, faq.answer]),
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean);
  return words.length;
}

export function computeReadTime(words: number) {
  return `${Math.max(1, Math.round(words / 200))} min`;
}

export function blogCanonicalPath(post: Pick<BlogPost, "slug" | "canonicalPath">) {
  const custom = post.canonicalPath.trim();
  if (!custom) return `/blog/${post.slug}`;
  if (custom.startsWith("http://") || custom.startsWith("https://")) {
    try {
      return new URL(custom).pathname || `/blog/${post.slug}`;
    } catch {
      return `/blog/${post.slug}`;
    }
  }
  return custom.startsWith("/") ? custom : `/${custom}`;
}

export function effectiveMetaTitle(post: Pick<BlogPost, "title" | "metaTitle">) {
  return post.metaTitle.trim() || post.title;
}

export function effectiveMetaDescription(post: Pick<BlogPost, "excerpt" | "metaDescription">) {
  return post.metaDescription.trim() || post.excerpt;
}

export function effectiveOgTitle(post: Pick<BlogPost, "title" | "metaTitle" | "ogTitle">) {
  return post.ogTitle.trim() || effectiveMetaTitle(post);
}

export function effectiveOgDescription(
  post: Pick<BlogPost, "excerpt" | "metaDescription" | "ogDescription">,
) {
  return post.ogDescription.trim() || effectiveMetaDescription(post);
}

export function effectiveOgImage(post: Pick<BlogPost, "image" | "ogImage">) {
  return post.ogImage.trim() || post.image;
}

export function containsKeyword(haystack: string, keyword: string) {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return false;
  return haystack.toLowerCase().includes(needle);
}
