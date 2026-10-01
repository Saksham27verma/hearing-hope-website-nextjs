export const JOB_NAMES = ["sync-search-console", "sync-web-vitals", "harvest-questions", "run-decision-engine", "run-generation", "daily-review-digest", "escalate-stale-drafts"] as const;
export type JobName = (typeof JOB_NAMES)[number];
export type JobSummary = { jobName: JobName; status: "success" | "partial" | "failed"; itemsProcessed: number; llmRequestsUsed: number; errors: string[]; notes: string };

export type GscRow = { date: string; pageUrl: string; query: string; country: string; device: string; clicks: number; impressions: number; ctr: number; position: number };
export type WebVital = { url: string; strategy: "mobile" | "desktop"; lcp: number | null; inp: number | null; cls: number | null; performanceScore: number | null; raw: Record<string, unknown> };
export type QuestionCandidate = { question: string; source: "gsc" | "reddit" | "staff"; volumeHint?: number };

export interface SearchConsoleClient { queryLastThreeDays(): Promise<GscRow[]>; inspectRecentlyPublishedUrls(): Promise<number>; }
export interface PageSpeedClient { measure(url: string, strategy: "mobile" | "desktop"): Promise<WebVital>; }
export interface RedditClient { questionTitles(): Promise<string[]>; }

export interface JobStore {
  start(jobName: JobName): Promise<string>;
  finish(id: string, summary: JobSummary): Promise<void>;
  upsertGsc(rows: GscRow[]): Promise<number>;
  upsertVital(vital: WebVital): Promise<void>;
  latestVital(url: string, strategy: "mobile" | "desktop"): Promise<WebVital | null>;
  questionQueries(): Promise<QuestionCandidate[]>;
  staffQuestions(): Promise<QuestionCandidate[]>;
  upsertQuestion(candidate: QuestionCandidate): Promise<void>;
}
