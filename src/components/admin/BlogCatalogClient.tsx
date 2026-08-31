"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Newspaper, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteBlogPost } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatBlogDate } from "@/data/blogs";
import { isRemoteImage } from "@/lib/product-media";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types";

export function BlogCatalogClient({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(posts.map((post) => post.category).filter(Boolean))].sort(),
    [posts],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (category !== "all" && post.category !== category) return false;
      if (status === "live" && !post.published) return false;
      if (status === "draft" && post.published) return false;
      if (!needle) return true;
      return (
        post.title.toLowerCase().includes(needle) ||
        post.slug.toLowerCase().includes(needle) ||
        post.focusKeyword.toLowerCase().includes(needle) ||
        post.category.toLowerCase().includes(needle)
      );
    });
  }, [category, posts, query, status]);

  const liveCount = posts.filter((post) => post.published).length;

  async function confirmDelete() {
    if (!toDelete) return;
    setPendingId(toDelete.id);
    setError(null);
    const result = await deleteBlogPost(toDelete.id);
    setPendingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setToDelete(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">Content</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Articles</h1>
          <p className="mt-2 text-sm text-brand-muted">
            {posts.length} articles · {liveCount} live · drafts stay off Google and the public blog.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          New article
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, slug or focus keyword"
            className="w-full rounded-2xl border border-brand-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/15"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-2xl border border-brand-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange"
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-2xl border border-brand-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange"
        >
          <option value="all">All status</option>
          <option value="live">Live</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-brand-orange">{error}</p> : null}

      {visible.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-black/5">
          <Newspaper className="mx-auto h-8 w-8 text-brand-orange" />
          <p className="mt-3 font-semibold text-brand-dark">No articles match these filters</p>
          <p className="mt-2 text-sm text-brand-muted">Clear search, or write a new article for the blog.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {visible.map((post) => (
            <li
              key={post.id}
              className="grid items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-black/5 sm:grid-cols-[auto_1fr_auto]"
            >
              <Link
                href={`/admin/blog/${post.id}`}
                className="relative h-20 w-28 overflow-hidden rounded-2xl bg-brand-surface"
              >
                {post.image ? (
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={!isRemoteImage(post.image) || post.image.endsWith(".svg")}
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted">
                    No cover
                  </span>
                )}
              </Link>
              <div className="min-w-0">
                <Link href={`/admin/blog/${post.id}`} className="font-bold text-brand-dark hover:text-brand-orange">
                  {post.title}
                </Link>
                <p className="mt-1 truncate text-sm text-brand-muted">/{post.slug}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={
                      post.published
                        ? "rounded-full bg-[#E7F7F3] px-2 py-0.5 text-[11px] font-semibold text-brand-teal"
                        : "rounded-full bg-brand-surface px-2 py-0.5 text-[11px] font-semibold text-brand-muted"
                    }
                  >
                    {post.published ? "Live" : "Draft"}
                  </span>
                  {post.category ? (
                    <span className="rounded-full bg-brand-surface px-2 py-0.5 text-[11px] font-semibold text-brand-dark">
                      {post.category}
                    </span>
                  ) : null}
                  {post.focusKeyword ? (
                    <span className="text-[11px] text-brand-muted">Keyword: {post.focusKeyword}</span>
                  ) : null}
                  <span className="text-[11px] text-brand-muted">
                    {formatBlogDate(post.publishedAt)} · {post.readTime} read
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-border px-3 py-2 text-sm font-semibold hover:bg-brand-surface"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setToDelete(post)}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete “${toDelete?.title ?? "this article"}”?`}
        body="This removes the article from the CMS and the public blog. Old URLs will 404 unless you have already changed the slug."
        pending={Boolean(pendingId)}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
