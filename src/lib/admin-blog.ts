import { fallbackBlogs } from "@/data/blogs";
import { requireAdmin } from "@/lib/admin";
import { BLOG_SELECT, mapBlogPostRow, type BlogPostRow } from "@/lib/blog";
import type { BlogPost } from "@/types";

export async function listAdminPosts(): Promise<BlogPost[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("Failed to load admin blog posts", error.message);
    return fallbackBlogs;
  }
  return ((data ?? []) as BlogPostRow[]).map(mapBlogPostRow);
}

export async function getAdminPost(id: string): Promise<BlogPost | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("blog_posts").select(BLOG_SELECT).eq("id", id).maybeSingle();
  if (error) {
    console.error("Failed to load article", error.message);
    return fallbackBlogs.find((post) => post.id === id) ?? null;
  }
  if (data) return mapBlogPostRow(data as BlogPostRow);
  return fallbackBlogs.find((post) => post.id === id) ?? null;
}
