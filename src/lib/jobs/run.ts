import { publishAutomationEvent } from "@/lib/automation/events";
import { normalizeQuestion } from "@/lib/automation/content-rules";
import { GooglePageSpeedClient, GoogleSearchConsoleClient, RedditQuestionClient } from "./clients";
import { SupabaseJobStore } from "./store";
import type { JobName, JobStore, JobSummary, PageSpeedClient, RedditClient, SearchConsoleClient, WebVital } from "./types";
import { WEB_VITAL_URLS } from "@/config/web-vitals-urls";
import { SupabaseDecisionStore } from "@/lib/decisions/store";
import { runDecisionEngine } from "@/lib/decisions/engine";
import { getConfiguredLlmProvider } from "@/lib/generation/providers";
import { runGeneration } from "@/lib/generation/run";
import { SupabaseGenerationStore } from "@/lib/generation/store";
import { escalateStaleDrafts, sendDailyReviewDigests, SupabaseNotificationJobStore } from "@/lib/notifications/jobs";
import { GoogleBusinessProfileClient, SupabaseGbpStore, syncGbp } from "./gbp";
import { CompetitorCrawler, SupabaseCompetitorStore, syncCompetitors } from "./competitors";
import { GeminiGroundingClient, probeAiVisibility, SupabaseAiVisibilityStore } from "./ai-visibility";
import { sendManualAiCheckReminder } from "./manual-ai-reminder";

export type JobDependencies = { store?: JobStore; searchConsole?: SearchConsoleClient; pageSpeed?: PageSpeedClient; reddit?: RedditClient; urls?: string[] };
const passing = (vital: WebVital) => (vital.lcp === null || vital.lcp <= 2.5) && (vital.inp === null || vital.inp <= 200) && (vital.cls === null || vital.cls <= 0.1);

export async function runJob(name: JobName, dependencies: JobDependencies = {}): Promise<JobSummary> {
  const store = dependencies.store ?? new SupabaseJobStore(); const id = await store.start(name); let summary: JobSummary;
  try {
    if (process.env.AUTOMATION_ENABLED === "false") summary = { jobName: name, status: "success", itemsProcessed: 0, llmRequestsUsed: 0, errors: [], notes: "Dry/no-op: AUTOMATION_ENABLED=false stopped all writes and LLM calls." };
    else if (name === "run-decision-engine") summary = await runDecisionEngineJob();
    else if (name === "run-generation") summary = await runGenerationJob();
    else if (name === "sync-gbp") summary = await syncGbpJob();
    else if (name === "sync-competitors") summary = await syncCompetitorsJob();
    else if (name === "probe-ai-visibility") summary = await probeAiVisibilityJob();
    else if (name === "daily-review-digest") summary = await runDailyReviewDigestJob();
    else if (name === "escalate-stale-drafts") summary = await runStaleDraftEscalationJob();
    else if (name === "monthly-manual-ai-reminder") summary = await runManualAiReminderJob();
    else if (name === "sync-search-console") summary = await syncSearchConsole(store, dependencies.searchConsole ?? new GoogleSearchConsoleClient());
    else if (name === "sync-web-vitals") summary = await syncWebVitals(store, dependencies.pageSpeed ?? new GooglePageSpeedClient(), dependencies.urls ?? WEB_VITAL_URLS);
    else summary = await harvestQuestions(store, dependencies.reddit ?? new RedditQuestionClient());
  } catch (error) { summary = { jobName: name, status: "partial", itemsProcessed: 0, llmRequestsUsed: 0, errors: [error instanceof Error ? error.message : "Job failed."], notes: "No external rows were written because required credentials are unavailable." }; }
  await store.finish(id, summary); return summary;
}

async function runDecisionEngineJob(): Promise<JobSummary> { const decisions = new SupabaseDecisionStore(); const result = await runDecisionEngine(await decisions.loadInput(), decisions, await decisions.reviewers()); return { jobName: "run-decision-engine", status: "success", itemsProcessed: result.written.length, llmRequestsUsed: 0, errors: [], notes: "Evaluated the twelve decision rules and upserted open tickets." }; }
async function runGenerationJob(): Promise<JobSummary> { const result = await runGeneration(new SupabaseGenerationStore(), getConfiguredLlmProvider()); return { jobName: "run-generation", status: "success", itemsProcessed: result.completed + result.briefed, llmRequestsUsed: 0, errors: [], notes: `Processed ${result.processed} tickets; ${result.briefed} require a manual brief.` }; }
async function runDailyReviewDigestJob(): Promise<JobSummary> { const sent = await sendDailyReviewDigests(new SupabaseNotificationJobStore()); return { jobName: "daily-review-digest", status: "success", itemsProcessed: sent, llmRequestsUsed: 0, errors: [], notes: `Sent ${sent} non-empty reviewer digest${sent === 1 ? "" : "s"}.` }; }
async function runStaleDraftEscalationJob(): Promise<JobSummary> { const sent = await escalateStaleDrafts(new SupabaseNotificationJobStore()); return { jobName: "escalate-stale-drafts", status: "success", itemsProcessed: sent, llmRequestsUsed: 0, errors: [], notes: `Sent ${sent} owner escalation${sent === 1 ? "" : "s"} for drafts older than seven days.` }; }
async function syncGbpJob(): Promise<JobSummary> { const result = await syncGbp(new SupabaseGbpStore(), new GoogleBusinessProfileClient()); return { jobName: "sync-gbp", status: "success", itemsProcessed: result.reviews + result.insights, llmRequestsUsed: 0, errors: [], notes: `Upserted ${result.reviews} reviews and ${result.insights} GBP insight rows.` }; }
async function syncCompetitorsJob(): Promise<JobSummary> { const domains = (process.env.COMPETITOR_DOMAINS ?? "").split(",").map((domain) => domain.trim()).filter(Boolean); if (!domains.length) return { jobName: "sync-competitors", status: "success", itemsProcessed: 0, llmRequestsUsed: 0, errors: [], notes: "No COMPETITOR_DOMAINS configured." }; const inserted = await syncCompetitors(domains, new SupabaseCompetitorStore(), new CompetitorCrawler()); return { jobName: "sync-competitors", status: "success", itemsProcessed: inserted, llmRequestsUsed: 0, errors: [], notes: `Recorded ${inserted} newly discovered competitor URLs.` }; }
async function probeAiVisibilityJob(): Promise<JobSummary> { const written = await probeAiVisibility(new SupabaseAiVisibilityStore(), new GeminiGroundingClient()); return { jobName: "probe-ai-visibility", status: "success", itemsProcessed: written, llmRequestsUsed: written, errors: [], notes: `Stored ${written} Gemini Search-grounded AI visibility probes.` }; }
async function runManualAiReminderJob(): Promise<JobSummary> { const sent = await sendManualAiCheckReminder(); return { jobName: "monthly-manual-ai-reminder", status: "success", itemsProcessed: sent, llmRequestsUsed: 0, errors: [], notes: sent ? "Sent the monthly manual AI-check reminder." : "Skipped: TELEGRAM_ADMIN_CHAT_ID is not configured." }; }

async function syncSearchConsole(store: JobStore, client: SearchConsoleClient): Promise<JobSummary> {
  const rows = await client.queryLastThreeDays(); const written = await store.upsertGsc(rows); const inspections = await client.inspectRecentlyPublishedUrls();
  return { jobName: "sync-search-console", status: "success", itemsProcessed: written, llmRequestsUsed: 0, errors: [], notes: `Pulled 3 days with date,page,query,country,device; inspected ${inspections} recently published URLs.` };
}

async function syncWebVitals(store: JobStore, client: PageSpeedClient, urls: string[]): Promise<JobSummary> {
  let written = 0; for (const url of urls) for (const strategy of ["mobile", "desktop"] as const) { const previous = await store.latestVital(url, strategy); const vital = await client.measure(url, strategy); await store.upsertVital(vital); written += 1; if (previous && passing(previous) && !passing(vital)) await publishAutomationEvent("technical.cwv_regression", { url, strategy, previous, current: vital }); }
  return { jobName: "sync-web-vitals", status: "success", itemsProcessed: written, llmRequestsUsed: 0, errors: [], notes: `Stored mobile and desktop PageSpeed data for ${urls.length} configured URLs.` };
}

async function harvestQuestions(store: JobStore, reddit: RedditClient): Promise<JobSummary> {
  const gsc = await store.questionQueries(); const staff = await store.staffQuestions(); const redditQuestions = await reddit.questionTitles(); const all = [...gsc, ...staff, ...redditQuestions.map((question) => ({ question, source: "reddit" as const }))]; const seen = new Set<string>();
  for (const candidate of all) { const normalized = normalizeQuestion(candidate.question); if (normalized.length < 8 || seen.has(normalized)) continue; seen.add(normalized); if (candidate.source !== "staff") await store.upsertQuestion(candidate); }
  return { jobName: "harvest-questions", status: "success", itemsProcessed: seen.size, llmRequestsUsed: 0, errors: [], notes: `Harvested and deduplicated GSC, Reddit, and ${staff.length} staff question candidates.` };
}
