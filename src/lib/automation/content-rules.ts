export const PAGE_TYPES = [
  "clinic",
  "product",
  "test",
  "condition",
  "guide",
  "comparison",
  "blog",
  "landing",
] as const;

export const PAGE_STATUSES = [
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "published",
  "archived",
] as const;

export const API_WRITABLE_STATUSES = ["draft", "in_review"] as const;

export const TICKET_TYPES = [
  "new_page",
  "refresh",
  "add_faq",
  "fix_schema",
  "meta_rewrite",
  "review_reply",
  "gbp_post",
  "technical_issue",
] as const;

export const TICKET_STATUSES = [
  "open",
  "generating",
  "brief_ready",
  "draft_ready",
  "in_review",
  "changes_requested",
  "approved",
  "published",
  "dismissed",
  "failed",
] as const;

export const API_FORBIDDEN_TICKET_STATUSES = ["approved", "published"] as const;

export const REVIEW_TRACKED_FIELDS = [
  "title",
  "meta_title",
  "meta_description",
  "canonical_url",
  "answer_summary",
  "body_markdown",
  "faq_items",
  "sources",
  "internal_links",
  "json_ld",
] as const;

export const BODY_FIELDS = ["title", "body_markdown", "answer_summary", "faq_items"] as const;

export type PageType = (typeof PAGE_TYPES)[number];
export type PageStatus = (typeof PAGE_STATUSES)[number];
export type GenerationSource = "ai" | "manual" | "human";

export type GenerationMeta = {
  source: GenerationSource;
  provider?: string;
  model?: string;
  trigger_ticket_id?: string;
  prompt_version?: string;
  generated_at?: string;
};

export type ContentPageInput = {
  slug?: string;
  page_type?: string;
  status?: string;
  title?: string;
  body_markdown?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  answer_summary?: string;
  faq_items?: unknown;
  json_ld?: unknown;
  sources?: unknown;
  author_id?: string | null;
  reviewed_by_id?: string | null;
  reviewed_at?: string | null;
  review_notes?: string;
  generation_meta?: GenerationMeta;
  priority_score?: number;
  internal_links?: unknown;
  source_table?: string | null;
  source_id?: string | null;
};

export type ContentPageRow = {
  id: string;
  slug: string;
  slug_locked: boolean;
  page_type: PageType;
  status: PageStatus;
  title: string;
  body_markdown: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  answer_summary: string;
  faq_items: unknown;
  json_ld: unknown;
  sources: unknown;
  author_id: string | null;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  review_notes: string;
  generation_meta: GenerationMeta;
  last_content_update_at: string;
  priority_score: number;
  internal_links: unknown;
  source_table: string | null;
  source_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const SOURCE_TABLES = new Set(["blog_posts", "products", "clinical_services", "clinics"]);

export function validateMetaLengths(metaTitle: string, metaDescription: string) {
  if (metaTitle.length > 60) return "meta_title must be 60 characters or fewer.";
  if (metaDescription.length > 160) return "meta_description must be 160 characters or fewer.";
  return null;
}

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function asJson(value: unknown, fallback: unknown) {
  if (value === undefined) return fallback;
  return value;
}

function cleanGeneration(input: GenerationMeta | undefined, source: GenerationSource): GenerationMeta {
  return {
    provider: input?.provider,
    model: input?.model,
    trigger_ticket_id: input?.trigger_ticket_id,
    prompt_version: input?.prompt_version,
    generated_at: input?.generated_at,
    source,
  };
}

export function buildCreateRow(input: ContentPageInput, source: GenerationSource) {
  const slug = (input.slug ?? "").trim();
  if (!slug) return { ok: false as const, error: "slug is required." };
  if (!PAGE_TYPES.includes(input.page_type as PageType)) {
    return { ok: false as const, error: "page_type is invalid." };
  }
  const metaTitle = input.meta_title ?? "";
  const metaDescription = input.meta_description ?? "";
  const metaError = validateMetaLengths(metaTitle, metaDescription);
  if (metaError) return { ok: false as const, error: metaError };
  if (input.source_table && !SOURCE_TABLES.has(input.source_table)) {
    return { ok: false as const, error: "source_table is invalid." };
  }

  return {
    ok: true as const,
    row: {
      slug,
      page_type: input.page_type,
      status: "draft",
      title: input.title ?? "",
      body_markdown: input.body_markdown ?? "",
      meta_title: metaTitle,
      meta_description: metaDescription,
      canonical_url: input.canonical_url ?? "",
      answer_summary: input.answer_summary ?? "",
      faq_items: asJson(input.faq_items, []),
      json_ld: asJson(input.json_ld, {}),
      sources: asJson(input.sources, []),
      author_id: input.author_id ?? null,
      reviewed_by_id: null,
      reviewed_at: null,
      review_notes: "",
      generation_meta: cleanGeneration(input.generation_meta, source),
      priority_score: Number.isFinite(input.priority_score) ? Number(input.priority_score) : 0,
      internal_links: asJson(input.internal_links, []),
      source_table: input.source_table ?? null,
      source_id: input.source_id ?? null,
      slug_locked: false,
    },
  };
}

export function buildAutomationPatch(existing: Pick<ContentPageRow, "slug" | "slug_locked" | "status">, input: ContentPageInput) {
  if ("reviewed_by_id" in input || "reviewed_at" in input) {
    return { ok: false as const, error: "reviewed_by_id and reviewed_at can only be set by a reviewer." };
  }
  if (input.status && !API_WRITABLE_STATUSES.includes(input.status as (typeof API_WRITABLE_STATUSES)[number])) {
    return { ok: false as const, error: "status cannot be set beyond in_review by the automation API." };
  }
  if (input.slug && input.slug !== existing.slug && (existing.slug_locked || existing.status === "published")) {
    return { ok: false as const, error: "slug is immutable after publish." };
  }
  if (input.page_type && !PAGE_TYPES.includes(input.page_type as PageType)) {
    return { ok: false as const, error: "page_type is invalid." };
  }
  if (input.meta_title !== undefined && input.meta_title.length > 60) {
    return { ok: false as const, error: "meta_title must be 60 characters or fewer." };
  }
  if (input.meta_description !== undefined && input.meta_description.length > 160) {
    return { ok: false as const, error: "meta_description must be 160 characters or fewer." };
  }

  const patch: Record<string, unknown> = {};
  const allowed = [
    "slug",
    "page_type",
    "status",
    "title",
    "body_markdown",
    "meta_title",
    "meta_description",
    "canonical_url",
    "answer_summary",
    "faq_items",
    "json_ld",
    "sources",
    "author_id",
    "review_notes",
    "priority_score",
    "internal_links",
    "source_table",
    "source_id",
  ] as const;
  for (const key of allowed) {
    if (input[key] !== undefined) patch[key] = input[key];
  }
  return { ok: true as const, patch };
}

export function approvalAuthDecision(authorization: string | null) {
  if (authorization && /^Bearer\s+\S+/i.test(authorization)) return "reject-bearer" as const;
  return "require-session" as const;
}

export function bearerMatches(authorization: string | null, expected: string | undefined) {
  if (!expected) return false;
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] === expected;
}

export function snapshotField(value: unknown) {
  if (typeof value === "string") return value;
  return JSON.stringify(value ?? null);
}

export function changedReviewFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  const changes: { field: string; ai_version: string; human_version: string }[] = [];
  for (const field of REVIEW_TRACKED_FIELDS) {
    const left = snapshotField(before[field]);
    const right = snapshotField(after[field]);
    if (left !== right) changes.push({ field, ai_version: left, human_version: right });
  }
  return changes;
}

export function shouldTrackReviewEdits(generation: { source?: string } | null | undefined) {
  return generation?.source === "ai" || generation?.source === "manual";
}

export function normalizeQuestion(question: string) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripJsonFence(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

export function parsePastedJson(raw: string) {
  try {
    const value = JSON.parse(stripJsonFence(raw)) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false as const, error: "Paste a single JSON object." };
    }
    return { ok: true as const, value };
  } catch {
    return { ok: false as const, error: "That response is not valid JSON." };
  }
}

export function encodeCursor(createdAt: string, id: string) {
  return Buffer.from(`${createdAt}|${id}`, "utf8").toString("base64url");
}

export function decodeCursor(cursor: string) {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const splitAt = decoded.lastIndexOf("|");
    if (splitAt <= 0) return null;
    return { createdAt: decoded.slice(0, splitAt), id: decoded.slice(splitAt + 1) };
  } catch {
    return null;
  }
}

export function ticketPatchAllowed(status: string | undefined) {
  if (!status) return { ok: true as const };
  if (!TICKET_STATUSES.includes(status as (typeof TICKET_STATUSES)[number])) {
    return { ok: false as const, error: "ticket status is invalid." };
  }
  if (API_FORBIDDEN_TICKET_STATUSES.includes(status as (typeof API_FORBIDDEN_TICKET_STATUSES)[number])) {
    return { ok: false as const, error: "ticket approval is a reviewer action." };
  }
  return { ok: true as const };
}
