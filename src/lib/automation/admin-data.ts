import { requireAdmin } from "@/lib/admin";

export type QueuePage = {
  id: string;
  slug: string;
  title: string;
  pageType: string;
  status: string;
  priorityScore: number;
  createdAt: string;
  updatedAt: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  answerSummary: string;
  bodyMarkdown: string;
  faqItems: unknown;
  jsonLd: unknown;
  sources: unknown;
  internalLinks: unknown;
  reviewNotes: string;
  generationMeta: { source?: string };
  authorId: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
};

export type QueueTicket = {
  id: string;
  type: string;
  status: string;
  priorityScore: number;
  reason: string;
  evidence: unknown;
  suggestedSlug: string;
  suggestedPageType: string;
  targetKeywords: string[];
  assignedReviewerId: string | null;
  generatedPageId: string | null;
  targetPageId: string | null;
  briefSystemPrompt: string;
  briefUserPrompt: string;
  attempts: number;
  lastError: string;
  createdAt: string;
};

function mapPage(row: Record<string, unknown>): QueuePage {
  return {
    id: String(row.id),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    pageType: String(row.page_type ?? ""),
    status: String(row.status ?? ""),
    priorityScore: Number(row.priority_score ?? 0),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
    metaTitle: String(row.meta_title ?? ""),
    metaDescription: String(row.meta_description ?? ""),
    canonicalUrl: String(row.canonical_url ?? ""),
    answerSummary: String(row.answer_summary ?? ""),
    bodyMarkdown: String(row.body_markdown ?? ""),
    faqItems: row.faq_items ?? [],
    jsonLd: row.json_ld ?? {},
    sources: row.sources ?? [],
    internalLinks: row.internal_links ?? [],
    reviewNotes: String(row.review_notes ?? ""),
    generationMeta: (row.generation_meta as { source?: string }) ?? {},
    authorId: row.author_id ? String(row.author_id) : null,
    reviewedById: row.reviewed_by_id ? String(row.reviewed_by_id) : null,
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
  };
}

function mapTicket(row: Record<string, unknown>): QueueTicket {
  return {
    id: String(row.id),
    type: String(row.type ?? ""),
    status: String(row.status ?? ""),
    priorityScore: Number(row.priority_score ?? 0),
    reason: String(row.reason ?? ""),
    evidence: row.evidence ?? {},
    suggestedSlug: String(row.suggested_slug ?? ""),
    suggestedPageType: String(row.suggested_page_type ?? ""),
    targetKeywords: Array.isArray(row.target_keywords) ? row.target_keywords.map(String) : [],
    assignedReviewerId: row.assigned_reviewer_id ? String(row.assigned_reviewer_id) : null,
    generatedPageId: row.generated_page_id ? String(row.generated_page_id) : null,
    targetPageId: row.target_page_id ? String(row.target_page_id) : null,
    briefSystemPrompt: String(row.brief_system_prompt ?? ""),
    briefUserPrompt: String(row.brief_user_prompt ?? ""),
    attempts: Number(row.attempts ?? 0),
    lastError: String(row.last_error ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

function isMissing(error: { message?: string } | null) {
  return Boolean(error && /does not exist|schema cache/i.test(error.message ?? ""));
}

export async function loadReviewQueue(filters: { pageType?: string; reviewerId?: string }) {
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("content_pages")
    .select("*")
    .in("status", ["draft", "in_review", "changes_requested"])
    .order("priority_score", { ascending: false })
    .order("created_at", { ascending: true });
  if (filters.pageType) query = query.eq("page_type", filters.pageType);
  const [{ data, error }, ticketsResult, teamResult] = await Promise.all([
    query,
    supabase.from("content_tickets").select("*").order("priority_score", { ascending: false }),
    supabase.from("team_members").select("id, name, is_reviewer, staff_role").order("name"),
  ]);
  if (isMissing(error) || isMissing(ticketsResult.error)) {
    return { missingTable: true, pages: [] as QueuePage[], tickets: [] as QueueTicket[], reviewers: [] as { id: string; name: string }[] };
  }
  const tickets = ((ticketsResult.data ?? []) as Record<string, unknown>[]).map(mapTicket);
  const pages = ((data ?? []) as Record<string, unknown>[]).map(mapPage).filter((page) => {
    if (!filters.reviewerId) return true;
    const ticket = tickets.find((item) => item.generatedPageId === page.id);
    return ticket?.assignedReviewerId === filters.reviewerId;
  });
  const reviewers = ((teamResult.data ?? []) as { id: string; name: string; is_reviewer?: boolean }[])
    .filter((member) => member.is_reviewer)
    .map((member) => ({ id: member.id, name: member.name }));
  return { missingTable: false, pages, tickets, reviewers };
}

export async function loadReviewPage(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("content_pages").select("*").eq("id", id).maybeSingle();
  if (isMissing(error)) return { missingTable: true, page: null, ticket: null };
  if (!data) return { missingTable: false, page: null, ticket: null };
  const page = mapPage(data as Record<string, unknown>);
  const { data: ticketRow } = await supabase
    .from("content_tickets")
    .select("*")
    .or(`generated_page_id.eq.${id},target_page_id.eq.${id}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    missingTable: false,
    page,
    ticket: ticketRow ? mapTicket(ticketRow as Record<string, unknown>) : null,
  };
}

export async function loadTickets() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("content_tickets").select("*").order("priority_score", { ascending: false }).order("created_at", { ascending: false });
  if (isMissing(error)) return { missingTable: true, tickets: [] as QueueTicket[] };
  return { missingTable: false, tickets: ((data ?? []) as Record<string, unknown>[]).map(mapTicket) };
}

export async function loadSignals() {
  const { supabase } = await requireAdmin();
  const since = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const [clicks, calls, ai, pending, usage, jobs] = await Promise.all([
    supabase.from("signals_search_console").select("clicks").gte("date", since),
    supabase.from("signals_gbp_insights").select("calls").gte("date", since),
    supabase.from("signals_ai_visibility").select("our_domain_cited"),
    supabase.from("content_pages").select("id", { count: "exact", head: true }).in("status", ["draft", "in_review", "changes_requested"]),
    supabase.from("llm_usage").select("requests").eq("date", today),
    supabase.from("job_runs").select("*").order("started_at", { ascending: false }).limit(10),
  ]);
  if (isMissing(clicks.error) || isMissing(jobs.error)) return { missingTable: true as const };
  const clickSum = ((clicks.data ?? []) as { clicks?: number }[]).reduce((sum, row) => sum + Number(row.clicks ?? 0), 0);
  const callSum = ((calls.data ?? []) as { calls?: number }[]).reduce((sum, row) => sum + Number(row.calls ?? 0), 0);
  const aiRows = (ai.data ?? []) as { our_domain_cited?: boolean }[];
  const cited = aiRows.filter((row) => row.our_domain_cited).length;
  const llmRequests = ((usage.data ?? []) as { requests?: number }[]).reduce((sum, row) => sum + Number(row.requests ?? 0), 0);
  return {
    missingTable: false as const,
    clicks: clickSum,
    calls: callSum,
    citationRate: aiRows.length ? Math.round((cited / aiRows.length) * 100) : 0,
    pending: pending.count ?? 0,
    llmRequests,
    llmCap: Number(process.env.LLM_DAILY_REQUEST_CAP || 40),
    jobs: (jobs.data ?? []) as Record<string, unknown>[],
  };
}

export async function loadProbeQuestions() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("ai_probe_questions").select("id, question, category, is_active").eq("is_active", true).order("category");
  if (isMissing(error)) return { missingTable: true, questions: [] as { id: string; question: string; category: string }[] };
  return {
    missingTable: false,
    questions: ((data ?? []) as { id: string; question: string; category: string }[]),
  };
}

export async function loadQuestionClinics() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("clinics").select("id, name, city").order("sort_order");
  if (error) return [];
  return ((data ?? []) as { id: string; name: string; city: string }[]);
}
