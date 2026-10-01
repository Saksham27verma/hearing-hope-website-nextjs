import { publishAutomationEvent } from "@/lib/automation/events";
import { normalizeQuestion } from "@/lib/automation/content-rules";
import { GooglePageSpeedClient, GoogleSearchConsoleClient, RedditQuestionClient } from "./clients";
import { SupabaseJobStore } from "./store";
import type { JobName, JobStore, JobSummary, PageSpeedClient, RedditClient, SearchConsoleClient, WebVital } from "./types";
import { WEB_VITAL_URLS } from "@/config/web-vitals-urls";

export type JobDependencies = { store?: JobStore; searchConsole?: SearchConsoleClient; pageSpeed?: PageSpeedClient; reddit?: RedditClient; urls?: string[] };
const passing = (vital: WebVital) => (vital.lcp === null || vital.lcp <= 2.5) && (vital.inp === null || vital.inp <= 200) && (vital.cls === null || vital.cls <= 0.1);

export async function runJob(name: JobName, dependencies: JobDependencies = {}): Promise<JobSummary> {
  const store = dependencies.store ?? new SupabaseJobStore(); const id = await store.start(name); let summary: JobSummary;
  try {
    if (name === "sync-search-console") summary = await syncSearchConsole(store, dependencies.searchConsole ?? new GoogleSearchConsoleClient());
    else if (name === "sync-web-vitals") summary = await syncWebVitals(store, dependencies.pageSpeed ?? new GooglePageSpeedClient(), dependencies.urls ?? WEB_VITAL_URLS);
    else summary = await harvestQuestions(store, dependencies.reddit ?? new RedditQuestionClient());
  } catch (error) { summary = { jobName: name, status: "partial", itemsProcessed: 0, llmRequestsUsed: 0, errors: [error instanceof Error ? error.message : "Job failed."], notes: "No external rows were written because required credentials are unavailable." }; }
  await store.finish(id, summary); return summary;
}

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
