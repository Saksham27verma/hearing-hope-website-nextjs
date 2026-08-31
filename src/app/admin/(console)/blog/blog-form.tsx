"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { deleteBlogPost, saveBlogPost, type BlogPostInput } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { adminField, adminLabel } from "@/components/admin/ui";
import { BLOG_CATEGORIES, blogAuthors } from "@/data/blogs";
import { uploadBlogCover } from "@/lib/blog-photo-client";
import {
  blogWordCount,
  computeReadTime,
  containsKeyword,
  effectiveMetaDescription,
  effectiveMetaTitle,
} from "@/lib/blog-utils";
import { slugify } from "@/lib/urls";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types";

type FormSection = {
  key: string;
  id: string;
  heading: string;
  paragraphs: string;
  list: string;
};

type FormFaq = { key: string; question: string; answer: string };

type FormState = Omit<BlogPostInput, "sections" | "faqs" | "keywords"> & {
  sections: FormSection[];
  faqs: FormFaq[];
  keywordsText: string;
};

function emptySection(): FormSection {
  return { key: crypto.randomUUID(), id: "", heading: "", paragraphs: "", list: "" };
}

function emptyFaq(): FormFaq {
  return { key: crypto.randomUUID(), question: "", answer: "" };
}

function emptyState(author = blogAuthors[0]): FormState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    category: BLOG_CATEGORIES[0],
    published: false,
    publishedAt: new Date().toISOString().slice(0, 10),
    image: "",
    imageAlt: "",
    authorName: author?.name ?? "",
    authorRole: author?.role ?? "",
    authorImage: author?.image ?? "",
    sections: [emptySection()],
    faqs: [],
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    keywordsText: "",
    canonicalPath: "",
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  };
}

function fromPost(post: BlogPost): FormState {
  return {
    id: post.id.startsWith("seed-") ? undefined : post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    published: post.published,
    publishedAt: post.publishedAt,
    image: post.image,
    imageAlt: post.imageAlt,
    authorName: post.author.name,
    authorRole: post.author.role,
    authorImage: post.author.image ?? "",
    sections: post.sections.length
      ? post.sections.map((section) => ({
          key: section.id || crypto.randomUUID(),
          id: section.id,
          heading: section.heading,
          paragraphs: section.paragraphs.join("\n\n"),
          list: (section.list ?? []).join("\n"),
        }))
      : [emptySection()],
    faqs: post.faqs.map((faq) => ({ key: crypto.randomUUID(), ...faq })),
    metaTitle: post.metaTitle === post.title ? "" : post.metaTitle,
    metaDescription: post.metaDescription === post.excerpt ? "" : post.metaDescription,
    focusKeyword: post.focusKeyword,
    keywordsText: post.keywords.join(", "),
    canonicalPath: post.canonicalPath,
    robotsIndex: post.robotsIndex,
    robotsFollow: post.robotsFollow,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    ogImage: post.ogImage,
  };
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseParagraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function keywordInSlug(slug: string, keyword: string) {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return false;
  return containsKeyword(slug, slugify(needle)) || containsKeyword(slug.replace(/-/g, " "), needle);
}

function scoreTone(ok: boolean) {
  return ok ? "text-brand-teal" : "text-brand-muted";
}

export function BlogForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => (post ? fromPost(post) : emptyState()));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canDelete = Boolean(form.id);

  function patch(partial: Partial<FormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  const sectionsForCount = form.sections.map((section) => ({
    id: section.id,
    heading: section.heading,
    paragraphs: parseParagraphs(section.paragraphs),
    list: parseLines(section.list),
  }));
  const faqsForCount = form.faqs
    .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }))
    .filter((faq) => faq.question && faq.answer);
  const words = blogWordCount({ sections: sectionsForCount, faqs: faqsForCount, excerpt: form.excerpt });
  const readTime = computeReadTime(words);

  const preview = {
    title: form.title,
    excerpt: form.excerpt,
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    ogTitle: form.ogTitle,
    ogDescription: form.ogDescription,
    ogImage: form.ogImage,
    image: form.image,
    slug: form.slug,
  };
  const metaTitle = effectiveMetaTitle(preview);
  const metaDescription = effectiveMetaDescription(preview);
  const keyword = form.focusKeyword.trim();
  const firstParagraph = sectionsForCount[0]?.paragraphs[0] ?? "";

  const checks = useMemo(
    () => [
      { ok: Boolean(keyword), label: "Focus keyword set" },
      { ok: containsKeyword(form.title, keyword), label: "Keyword in title (H1)" },
      { ok: keywordInSlug(form.slug, keyword), label: "Keyword in URL slug" },
      { ok: containsKeyword(metaDescription, keyword), label: "Keyword in meta description" },
      { ok: containsKeyword(firstParagraph, keyword), label: "Keyword in first paragraph" },
      {
        ok: sectionsForCount.some((section) => containsKeyword(section.heading, keyword)),
        label: "Keyword in at least one H2",
      },
      { ok: metaTitle.length >= 50 && metaTitle.length <= 60, label: "Meta title 50–60 characters" },
      {
        ok: metaDescription.length >= 140 && metaDescription.length <= 160,
        label: "Meta description 140–160 characters",
      },
      { ok: Boolean(form.image && form.imageAlt.trim()), label: "Cover image with alt text" },
      { ok: Boolean(form.authorName.trim()), label: "Author named" },
      { ok: words >= 300, label: "At least 300 words" },
    ],
    [firstParagraph, form.authorName, form.image, form.imageAlt, form.slug, form.title, keyword, metaDescription, metaTitle.length, sectionsForCount, words],
  );

  const passed = checks.filter((item) => item.ok).length;

  async function onUpload(files: FileList) {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadBlogCover(form.slug || form.title || "article", file);
      patch({ image: url, imageAlt: form.imageAlt || form.title });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function applyAuthor(name: string) {
    const match = blogAuthors.find((author) => author.name === name);
    if (!match) return;
    patch({
      authorName: match.name,
      authorRole: match.role,
      authorImage: match.image ?? "",
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const payload: BlogPostInput = {
      ...form,
      slug: slugify(form.slug || form.title),
      keywords: form.keywordsText.split(",").map((item) => item.trim()).filter(Boolean),
      sections: form.sections.map((section) => ({
        id: section.id,
        heading: section.heading,
        paragraphs: parseParagraphs(section.paragraphs),
        list: parseLines(section.list),
      })),
      faqs: form.faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
    };
    const result = await saveBlogPost(payload);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  }

  async function onDelete() {
    if (!form.id) return;
    setPending(true);
    setError(null);
    const result = await deleteBlogPost(form.id);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  }

  const matchedAuthor = blogAuthors.find((author) => author.name === form.authorName);

  return (
    <form onSubmit={onSubmit} className="pb-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">
            <Link href="/admin/blog" className="hover:underline">
              Articles
            </Link>
            <span className="px-1.5 text-brand-muted">/</span>
            {post ? "Edit" : "New"}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{post ? post.title : "New article"}</h1>
          <p className="mt-2 max-w-xl text-sm text-brand-muted">
            Write in sections (H2 + paragraphs + optional bullets). The SEO panel on the right tracks the focus
            keyword and meta tags.
          </p>
        </div>
        {post?.published && post.slug ? (
          <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-brand-teal hover:underline" target="_blank">
            View on website
          </Link>
        ) : null}
      </div>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5 lg:p-8">
            <h2 className="text-lg font-bold">1. Status and identity</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <Toggle checked={form.published} onChange={(published) => patch({ published })} label="Published" />
              <Toggle
                checked={form.robotsIndex}
                onChange={(robotsIndex) => patch({ robotsIndex })}
                label="Index in search"
              />
              <Toggle
                checked={form.robotsFollow}
                onChange={(robotsFollow) => patch({ robotsFollow })}
                label="Follow links"
              />
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="lg:col-span-2">
                <span className={adminLabel}>Title (H1)</span>
                <input
                  className={adminField}
                  required
                  placeholder="7 signs it’s time for a hearing test"
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    patch({ title, slug: slugTouched ? form.slug : slugify(title) });
                  }}
                />
              </label>
              <label>
                <span className={adminLabel}>URL slug</span>
                <input
                  className={adminField}
                  required
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    patch({ slug: slugify(event.target.value) });
                  }}
                />
                <span className="mt-1 block text-xs text-brand-muted">/blog/{form.slug || "…"}</span>
              </label>
              <label>
                <span className={adminLabel}>Publish date</span>
                <input
                  className={adminField}
                  type="date"
                  required
                  value={form.publishedAt}
                  onChange={(event) => patch({ publishedAt: event.target.value })}
                />
              </label>
              <label>
                <span className={adminLabel}>Category</span>
                <input
                  className={adminField}
                  list="blog-categories"
                  value={form.category}
                  onChange={(event) => patch({ category: event.target.value })}
                />
                <datalist id="blog-categories">
                  {BLOG_CATEGORIES.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </label>
              <label>
                <span className={adminLabel}>Author</span>
                <select
                  className={adminField}
                  value={matchedAuthor?.name ?? "custom"}
                  onChange={(event) => {
                    if (event.target.value === "custom") return;
                    applyAuthor(event.target.value);
                  }}
                >
                  {blogAuthors.map((author) => (
                    <option key={author.name} value={author.name}>
                      {author.name}
                    </option>
                  ))}
                  <option value="custom">Custom author</option>
                </select>
              </label>
              <label>
                <span className={adminLabel}>Author name</span>
                <input
                  className={adminField}
                  value={form.authorName}
                  onChange={(event) => patch({ authorName: event.target.value })}
                />
              </label>
              <label>
                <span className={adminLabel}>Author role</span>
                <input
                  className={adminField}
                  value={form.authorRole}
                  onChange={(event) => patch({ authorRole: event.target.value })}
                />
              </label>
              <label className="lg:col-span-2">
                <span className={adminLabel}>Excerpt</span>
                <textarea
                  className={cn(adminField, "min-h-24 resize-y")}
                  value={form.excerpt}
                  onChange={(event) => patch({ excerpt: event.target.value })}
                />
              </label>
            </div>
          </section>

          <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-black/5 lg:p-8">
            <h2 className="text-lg font-bold">2. Cover image</h2>
            <p className="mt-1 text-sm text-brand-muted">Used as the article hero, Open Graph image, and card thumbnail.</p>
            <div className="mt-5">
              <ImageDropzone
                images={form.image ? [{ url: form.image, alt: form.imageAlt }] : []}
                uploading={uploading}
                emptyLabel="PNG, JPG or WebP. Converted to WebP and stored in blog-images."
                onUpload={onUpload}
                onChange={(images) => patch({ image: images[0]?.url ?? "", imageAlt: images[0]?.alt ?? form.imageAlt })}
              />
            </div>
            <label className="mt-4 block">
              <span className={adminLabel}>Alt text</span>
              <input
                className={adminField}
                placeholder="What the cover shows"
                value={form.imageAlt}
                onChange={(event) => patch({ imageAlt: event.target.value })}
              />
            </label>
          </section>

          <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-black/5 lg:p-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">3. Article body</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Each block is an H2. Separate paragraphs with a blank line. Optional bullets, one per line.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal"
                onClick={() => patch({ sections: [...form.sections, emptySection()] })}
              >
                <Plus className="h-4 w-4" />
                Section
              </button>
            </div>
            <ul className="mt-5 space-y-4">
              {form.sections.map((section, index) => (
                <li key={section.key} className="rounded-2xl bg-brand-surface p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                      Section {String(index + 1).padStart(2, "0")}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded-full p-1.5 text-brand-muted hover:bg-white disabled:opacity-30"
                        disabled={index === 0}
                        onClick={() => {
                          const next = [...form.sections];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          patch({ sections: next });
                        }}
                        aria-label="Move section up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-full p-1.5 text-brand-muted hover:bg-white disabled:opacity-30"
                        disabled={index === form.sections.length - 1}
                        onClick={() => {
                          const next = [...form.sections];
                          [next[index + 1], next[index]] = [next[index], next[index + 1]];
                          patch({ sections: next });
                        }}
                        aria-label="Move section down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-full p-1.5 text-brand-muted hover:bg-white hover:text-red-600"
                        onClick={() =>
                          patch({
                            sections: form.sections.length > 1 ? form.sections.filter((_, i) => i !== index) : [emptySection()],
                          })
                        }
                        aria-label="Remove section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <label className="block">
                    <span className={adminLabel}>Heading</span>
                    <input
                      className={adminField}
                      placeholder="Why early testing matters"
                      value={section.heading}
                      onChange={(event) => {
                        const sections = [...form.sections];
                        sections[index] = { ...section, heading: event.target.value };
                        patch({ sections });
                      }}
                    />
                  </label>
                  <label className="mt-3 block">
                    <span className={adminLabel}>Paragraphs</span>
                    <textarea
                      className={cn(adminField, "min-h-32 resize-y")}
                      placeholder="One paragraph, then a blank line, then the next."
                      value={section.paragraphs}
                      onChange={(event) => {
                        const sections = [...form.sections];
                        sections[index] = { ...section, paragraphs: event.target.value };
                        patch({ sections });
                      }}
                    />
                  </label>
                  <label className="mt-3 block">
                    <span className={adminLabel}>Bullet list (optional)</span>
                    <textarea
                      className={cn(adminField, "min-h-20 resize-y")}
                      placeholder={"One point per line"}
                      value={section.list}
                      onChange={(event) => {
                        const sections = [...form.sections];
                        sections[index] = { ...section, list: event.target.value };
                        patch({ sections });
                      }}
                    />
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-black/5 lg:p-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">4. FAQs (optional)</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Shown at the end of the article and as FAQPage structured data.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal"
                onClick={() => patch({ faqs: [...form.faqs, emptyFaq()] })}
              >
                <Plus className="h-4 w-4" />
                FAQ
              </button>
            </div>
            {form.faqs.length ? (
              <ul className="mt-5 space-y-3">
                {form.faqs.map((faq, index) => (
                  <li key={faq.key} className="grid gap-2 rounded-2xl bg-brand-surface p-3">
                    <input
                      className={adminField}
                      placeholder="Question"
                      value={faq.question}
                      onChange={(event) => {
                        const faqs = [...form.faqs];
                        faqs[index] = { ...faq, question: event.target.value };
                        patch({ faqs });
                      }}
                    />
                    <textarea
                      className={cn(adminField, "min-h-20 resize-y")}
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(event) => {
                        const faqs = [...form.faqs];
                        faqs[index] = { ...faq, answer: event.target.value };
                        patch({ faqs });
                      }}
                    />
                    <button
                      type="button"
                      className="justify-self-end text-brand-muted hover:text-red-600"
                      onClick={() => patch({ faqs: form.faqs.filter((_, i) => i !== index) })}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-brand-muted">No FAQs yet — add a pair if the article answers common questions.</p>
            )}
          </section>

          <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-black/5 lg:p-8 xl:hidden">
            <SeoFields
              form={form}
              patch={patch}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              checks={checks}
              passed={passed}
              words={words}
              readTime={readTime}
            />
          </section>
        </div>

        <aside className="hidden xl:sticky xl:top-8 xl:block">
          <div className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
            <SeoFields
              form={form}
              patch={patch}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              checks={checks}
              passed={passed}
              words={words}
              readTime={readTime}
            />
          </div>
        </aside>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 lg:px-8">
          <p className="text-sm text-brand-muted">
            {form.published ? "Will appear on the public blog" : "Saved as a draft — not on the website"}
            {form.published && !form.robotsIndex ? " · hidden from search" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {canDelete ? (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Delete article
              </button>
            ) : null}
            <Link
              href="/admin/blog"
              className="rounded-full border border-brand-border px-4 py-2.5 text-sm font-semibold hover:bg-brand-surface"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={pending || uploading}
              className="rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
            >
              {pending ? "Saving…" : post ? "Save changes" : "Create article"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete ${form.title || "this article"}?`}
        body="This permanently removes the article from the CMS and the public blog."
        pending={pending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={onDelete}
      />
    </form>
  );
}

function SeoFields({
  form,
  patch,
  metaTitle,
  metaDescription,
  checks,
  passed,
  words,
  readTime,
}: {
  form: FormState;
  patch: (partial: Partial<FormState>) => void;
  metaTitle: string;
  metaDescription: string;
  checks: { ok: boolean; label: string }[];
  passed: number;
  words: number;
  readTime: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold">SEO</h2>
      <p className="mt-1 text-sm text-brand-muted">
        {passed}/{checks.length} checks · {words} words · {readTime} read
      </p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-brand-surface">
        <div
          className="h-full rounded-full bg-brand-teal"
          style={{ width: `${Math.round((passed / checks.length) * 100)}%` }}
        />
      </div>
      <ul className="mt-4 space-y-1.5">
        {checks.map((item) => (
          <li key={item.label} className={cn("flex items-start gap-2 text-xs leading-5", scoreTone(item.ok))}>
            <Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", item.ok ? "text-brand-teal" : "text-brand-border")} />
            {item.label}
          </li>
        ))}
      </ul>

      <label className="mt-5 block">
        <span className={adminLabel}>Focus keyword</span>
        <input
          className={adminField}
          placeholder="hearing test"
          value={form.focusKeyword}
          onChange={(event) => patch({ focusKeyword: event.target.value })}
        />
      </label>
      <label className="mt-3 block">
        <span className={adminLabel}>Supporting keywords</span>
        <input
          className={adminField}
          placeholder="audiogram, Delhi NCR"
          value={form.keywordsText}
          onChange={(event) => patch({ keywordsText: event.target.value })}
        />
        <span className="mt-1 block text-xs text-brand-muted">Comma-separated. Used in JSON-LD, not a meta keywords tag.</span>
      </label>
      <label className="mt-3 block">
        <span className={adminLabel}>Meta title · {metaTitle.length} chars</span>
        <input
          className={adminField}
          placeholder={form.title || "Inherits the H1"}
          value={form.metaTitle}
          onChange={(event) => patch({ metaTitle: event.target.value })}
        />
      </label>
      <label className="mt-3 block">
        <span className={adminLabel}>Meta description · {metaDescription.length} chars</span>
        <textarea
          className={cn(adminField, "min-h-24 resize-y")}
          placeholder={form.excerpt || "Inherits the excerpt"}
          value={form.metaDescription}
          onChange={(event) => patch({ metaDescription: event.target.value })}
        />
      </label>
      <label className="mt-3 block">
        <span className={adminLabel}>Canonical path</span>
        <input
          className={adminField}
          placeholder={`/blog/${form.slug || "article-slug"}`}
          value={form.canonicalPath}
          onChange={(event) => patch({ canonicalPath: event.target.value })}
        />
      </label>
      <label className="mt-3 block">
        <span className={adminLabel}>Open Graph title</span>
        <input
          className={adminField}
          placeholder="Inherits meta title"
          value={form.ogTitle}
          onChange={(event) => patch({ ogTitle: event.target.value })}
        />
      </label>
      <label className="mt-3 block">
        <span className={adminLabel}>Open Graph description</span>
        <textarea
          className={cn(adminField, "min-h-20 resize-y")}
          placeholder="Inherits meta description"
          value={form.ogDescription}
          onChange={(event) => patch({ ogDescription: event.target.value })}
        />
      </label>
      <label className="mt-3 block">
        <span className={adminLabel}>Open Graph image URL</span>
        <input
          className={adminField}
          placeholder="Inherits the cover image"
          value={form.ogImage}
          onChange={(event) => patch({ ogImage: event.target.value })}
        />
      </label>
    </div>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ring-1",
        checked ? "bg-[#E7F7F3] text-brand-teal ring-brand-teal/20" : "bg-white text-brand-muted ring-black/10",
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", checked ? "bg-brand-teal" : "bg-brand-border")} />
      {label}
    </button>
  );
}
