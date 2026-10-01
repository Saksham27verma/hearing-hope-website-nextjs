import type { PageType } from "@/lib/automation/content-rules";

export type DecisionTicketType = "new_page" | "refresh" | "add_faq" | "fix_schema" | "meta_rewrite" | "gbp_post" | "technical_issue";
export type DecisionCandidate = {
  type: DecisionTicketType;
  target: string;
  priorityScore: number;
  reason: string;
  evidence: Record<string, unknown>;
  suggestedSlug?: string;
  suggestedPageType?: PageType;
  targetKeywords?: string[];
  targetClinicId?: string;
  targetPageId?: string;
  needsMedicalReview?: boolean;
};

export type DecisionPage = { id: string; slug: string; pageType: PageType; title: string; bodyMarkdown: string; faqItems: Array<{ question: string; answer: string }>; jsonLd: unknown; reviewedById: string | null; updatedAt: string; impressions: number };
export type DecisionInput = {
  now: Date;
  pages: DecisionPage[];
  searchQueries: Array<{ query: string; impressions: number; ctr: number; position: number; previousPosition?: number; pageId?: string }>;
  questions: Array<{ id: string; question: string; seenCount: number; source: "gsc" | "reddit" | "staff" }>;
  competitors: Array<{ url: string; title: string; firstSeenAt: string }>;
  aiVisibility: Array<{ question: string; pageId?: string; ourDomainCited: boolean; competitorCited: boolean }>;
  clinics: Array<{ id: string; name: string; reviewCount30d: number; gbpReviewLink: string; lastPostAt: string | null }>;
  cwvRegressions: Array<{ url: string; lcp: number | null; inp: number | null; cls: number | null }>;
};

const YMYL_TYPES = new Set<PageType>(["test", "condition", "product", "guide"]);
export function isYmylPageType(value: PageType | undefined) { return Boolean(value && YMYL_TYPES.has(value)); }
export function normalTokens(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean); }
export function tokenOverlap(left: string, right: string) { const a = new Set(normalTokens(left)); const b = new Set(normalTokens(right)); if (!a.size || !b.size) return 0; let shared = 0; for (const token of a) if (b.has(token)) shared += 1; return shared / Math.max(a.size, b.size); }
export function slugFor(question: string) { return normalTokens(question).slice(0, 8).join("-"); }
