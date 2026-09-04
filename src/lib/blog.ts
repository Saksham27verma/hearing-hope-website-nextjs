import { cache } from "react";
import { revalidateTag, updateTag, unstable_cache } from "next/cache";
import { fallbackBlogs, hydrateBlogPost } from "@/data/blogs";
import { asBlogFaqs, asBlogSections } from "@/lib/blog-utils";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { BlogPost } from "@/types";

export {
  asBlogFaqs,
  asBlogSections,
  blogCanonicalPath,
  blogWordCount,
  computeReadTime,
  containsKeyword,
  effectiveMetaDescription,
  effectiveMetaTitle,
  effectiveOgDescription,
  effectiveOgImage,
  effectiveOgTitle,
} from "@/lib/blog-utils";

export const BLOG_TAG = "blog";

export const BLOG_SELECT = `
  id,
  slug,
  title,
  excerpt,
  category,
  published,
  published_at,
  updated_at,
  read_time,
  image,
  image_alt,
  author_name,
  author_role,
  author_image,
  sections,
  faqs,
  meta_title,
  meta_description,
  focus_keyword,
  keywords,
  canonical_path,
  robots_index,
  robots_follow,
  og_title,
  og_description,
  og_image
`;

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: boolean;
  published_at: string;
  updated_at?: string | null;
  read_time: string;
  image: string;
  image_alt: string;
  author_name: string;
  author_role: string;
  author_image: string;
  sections: unknown;
  faqs: unknown;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  keywords: string[] | null;
  canonical_path: string;
  robots_index: boolean;
  robots_follow: boolean;
  og_title: string;
  og_description: string;
  og_image: string;
};

function asDate(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  return value.slice(0, 10);
}

export function mapBlogPostRow(row: BlogPostRow): BlogPost {
  const publishedAt = asDate(row.published_at, new Date().toISOString().slice(0, 10));
  return hydrateBlogPost({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    published: row.published,
    publishedAt,
    updatedAt: asDate(row.updated_at, publishedAt),
    readTime: row.read_time,
    image: row.image,
    imageAlt: row.image_alt,
    author: {
      name: row.author_name,
      role: row.author_role,
      image: row.author_image || undefined,
    },
    sections: asBlogSections(row.sections),
    faqs: asBlogFaqs(row.faqs),
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    focusKeyword: row.focus_keyword,
    keywords: row.keywords ?? [],
    canonicalPath: row.canonical_path,
    robotsIndex: row.robots_index,
    robotsFollow: row.robots_follow,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    ogImage: row.og_image,
  });
}

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) {
    return fallbackBlogs
      .filter((post) => post.published)
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT)
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load blog posts", error?.message);
    return fallbackBlogs.filter((post) => post.published);
  }

  return (data as BlogPostRow[]).map(mapBlogPostRow);
}

const cachedPublishedPosts = unstable_cache(fetchPublishedPosts, ["blog-published"], {
  tags: [BLOG_TAG],
});

export const listPublishedPosts = cache(async () => cachedPublishedPosts());

export async function lookupBlogRedirect(slug: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("blog_redirects").select("to_slug").eq("from_slug", slug).maybeSingle();
  if (error || !data?.to_slug) return null;
  return data.to_slug;
}

export type BlogSlugResult =
  | { status: "ok"; post: BlogPost }
  | { status: "redirect"; slug: string }
  | { status: "missing" };

export async function resolveBlogSlug(slug: string): Promise<BlogSlugResult> {
  const posts = await listPublishedPosts();
  const post = posts.find((item) => item.slug === slug);
  if (post) return { status: "ok", post };
  const target = await lookupBlogRedirect(slug);
  if (target && target !== slug) return { status: "redirect", slug: target };
  return { status: "missing" };
}

export async function getPostBySlug(slug: string) {
  const posts = await listPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export function invalidateBlog(_slugs?: string[]) {
  try {
    updateTag(BLOG_TAG);
  } catch {
    // updateTag is a Server Action API; revalidateTag still expires the cache.
  }
  revalidateTag(BLOG_TAG, "max");
}
