import { describe, expect, it } from "vitest";
import type { DecisionInput } from "./types";
import { rule1MissingPage, rule2QuestionWithoutAnswer, rule3StalePage, rule4PositionDrop, rule5LowCtr, rule6SchemaGap, rule7NotReviewed, rule8CompetitorCoverage, rule9AiVisibilityGap, rule10ReviewPipeline, rule11CwvRegression, rule12GbpPostCadence } from "./rules";
import { runDecisionEngine, type DecisionStore, type StoredDecisionTicket } from "./engine";

const now = new Date("2026-10-01T00:00:00.000Z");
const page = { id: "page-1", slug: "bera-test", pageType: "test" as const, title: "BERA test", bodyMarkdown: "A BERA test measures hearing pathways.", faqItems: [], jsonLd: {}, reviewedById: null, updatedAt: "2026-06-01T00:00:00.000Z", impressions: 1_500 };
const input = (changes: Partial<DecisionInput> = {}): DecisionInput => ({ now, pages: [page], searchQueries: [], questions: [], competitors: [], aiVisibility: [], clinics: [], cwvRegressions: [], ...changes });

describe("Phase 4 decision rules", () => {
  it("rule 1 clusters a missing high-impression query", () => expect(rule1MissingPage(input({ searchQueries: [{ query: "hearing aid cost india", impressions: 500, ctr: 0.01, position: 22 }] }))).toHaveLength(1));
  it("rule 2 accepts any staff question without waiting for three sightings", () => expect(rule2QuestionWithoutAnswer(input({ questions: [{ id: "q", question: "Can hearing aids help tinnitus?", seenCount: 1, source: "staff" }] }))[0]).toMatchObject({ reason: "Repeated patient question has no matching answer." }));
  it("rule 3 refreshes an old, visible page", () => expect(rule3StalePage(input())).toHaveLength(1));
  it("rule 4 identifies a material search-position drop", () => expect(rule4PositionDrop(input({ searchQueries: [{ query: "bera test", impressions: 300, ctr: 0.1, position: 13, previousPosition: 7, pageId: "page-1" }] }))).toHaveLength(1));
  it("rule 5 identifies a visible low-CTR result", () => expect(rule5LowCtr(input({ searchQueries: [{ query: "bera test", impressions: 1_100, ctr: 0.01, position: 8, pageId: "page-1" }] }))).toHaveLength(1));
  it("rule 6 identifies a missing JSON-LD or FAQ", () => expect(rule6SchemaGap(input())).toHaveLength(1));
  it("rule 7 gives an unreviewed YMYL page top priority", () => expect(rule7NotReviewed(input())[0]).toMatchObject({ needsMedicalReview: true, priorityScore: 1_000_000 }));
  it("rule 8 creates coverage for a recent competitor page", () => expect(rule8CompetitorCoverage(input({ competitors: [{ url: "https://example.test/hearing-aid-cost", title: "Hearing aid cost guide", firstSeenAt: "2026-09-30T00:00:00.000Z" }] }))).toHaveLength(1));
  it("rule 9 requires two consecutive uncited AI visibility results", () => expect(rule9AiVisibilityGap(input({ aiVisibility: [{ question: "BERA test", ourDomainCited: false, competitorCited: true, pageId: "page-1" }, { question: "BERA test", ourDomainCited: false, competitorCited: true, pageId: "page-1" }] }))).toHaveLength(1));
  it("rule 10 produces a review nudge candidate", () => expect(rule10ReviewPipeline(input({ clinics: [{ id: "clinic-1", name: "Rohini", reviewCount30d: 1, gbpReviewLink: "https://review.example", lastPostAt: now.toISOString() }] }))[0].evidence).toMatchObject({ action: "review_nudge" }));
  it("rule 11 turns a CWV regression into a technical ticket", () => expect(rule11CwvRegression(input({ cwvRegressions: [{ url: "https://www.hearinghope.in", lcp: 3, inp: 100, cls: 0.02 }] }))[0].type).toBe("technical_issue"));
  it("rule 12 identifies an overdue GBP post", () => expect(rule12GbpPostCadence(input({ clinics: [{ id: "clinic-1", name: "Rohini", reviewCount30d: 3, gbpReviewLink: "", lastPostAt: "2026-08-01T00:00:00.000Z" }] }))).toHaveLength(1));
});

class MemoryStore implements DecisionStore {
  rows: StoredDecisionTicket[] = [];
  async listOpen() { return this.rows.filter((row) => row.status === "open"); }
  async save(candidate: Parameters<DecisionStore["save"]>[0], reviewerId: string | null, existing?: StoredDecisionTicket) { const row = existing ?? { id: `${this.rows.length + 1}`, type: candidate.type, target: candidate.target, status: "open", priorityScore: 0, evidence: {}, assignedReviewerId: null }; row.priorityScore = candidate.priorityScore; row.evidence = candidate.evidence; row.assignedReviewerId = reviewerId; if (!existing) this.rows.push(row); return row; }
}

it("deduplicates tickets, refreshes evidence, assigns reviewers, and calls urgent effects", async () => {
  const store = new MemoryStore(); let nudges = 0; let alerts = 0;
  const signals = input({ searchQueries: [{ query: "hearing aid cost india", impressions: 500, ctr: 0.1, position: 22 }, { query: "bera test", impressions: 1_100, ctr: 0.01, position: 8, pageId: "page-1" }], clinics: [{ id: "clinic", name: "Rohini", reviewCount30d: 0, gbpReviewLink: "https://review", lastPostAt: now.toISOString() }], cwvRegressions: [{ url: "https://www.hearinghope.in", lcp: 3, inp: 100, cls: 0.02 }] });
  const reviewers = [{ id: "audio", staffRole: "audiologist" as const, isReviewer: true }, { id: "marketing", staffRole: "marketing" as const, isReviewer: true }, { id: "admin", staffRole: "admin" as const, isReviewer: true }];
  await runDecisionEngine(signals, store, reviewers, { sendReviewNudge: async () => { nudges += 1; }, sendDeveloperAlert: async () => { alerts += 1; } }); await runDecisionEngine(signals, store, reviewers);
  expect(store.rows).toHaveLength(6); expect(store.rows.find((row) => row.type === "technical_issue")?.assignedReviewerId).toBe("admin"); expect(store.rows.find((row) => row.type === "new_page")?.assignedReviewerId).toBe("audio"); expect(store.rows.find((row) => row.type === "meta_rewrite")?.assignedReviewerId).toBe("marketing"); expect(store.rows.some((row) => row.evidence.action === "review_nudge")).toBe(false); expect(nudges).toBe(1); expect(alerts).toBe(1);
});

it("dry-run still writes tickets but suppresses notification effects", async () => {
  const store = new MemoryStore(); let sent = 0;
  const signals = input({ clinics: [{ id: "clinic", name: "Rohini", reviewCount30d: 0, gbpReviewLink: "https://review", lastPostAt: now.toISOString() }], cwvRegressions: [{ url: "https://www.hearinghope.in", lcp: 3, inp: 100, cls: 0.02 }] });
  await runDecisionEngine(signals, store, [{ id: "admin", staffRole: "admin", isReviewer: true }], { sendReviewNudge: async () => { sent += 1; }, sendDeveloperAlert: async () => { sent += 1; } }, { dryRun: true });
  expect(store.rows.length).toBeGreaterThan(0); expect(sent).toBe(0);
});
