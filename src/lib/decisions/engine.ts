import type { DecisionCandidate, DecisionInput, DecisionTicketType } from "./types";
import { evaluateDecisionRules } from "./rules";
import { isYmylPageType } from "./types";

export type DecisionReviewer = { id: string; staffRole: "audiologist" | "marketing" | "admin"; isReviewer: boolean };
export type StoredDecisionTicket = { id: string; type: DecisionTicketType; target: string; status: string; priorityScore: number; evidence: Record<string, unknown>; assignedReviewerId: string | null };
export interface DecisionStore { listOpen(): Promise<StoredDecisionTicket[]>; save(candidate: DecisionCandidate, reviewerId: string | null, existing?: StoredDecisionTicket): Promise<StoredDecisionTicket>; }
export type DecisionEffects = { sendReviewNudge?: (candidate: DecisionCandidate) => Promise<void>; sendDeveloperAlert?: (candidate: DecisionCandidate) => Promise<void> };

export function reviewerFor(candidate: DecisionCandidate, reviewers: DecisionReviewer[], index = 0) {
  const role = candidate.type === "technical_issue" ? "admin" : candidate.type === "gbp_post" || candidate.type === "meta_rewrite" || candidate.suggestedPageType === "clinic" ? "marketing" : isYmylPageType(candidate.suggestedPageType) || candidate.needsMedicalReview ? "audiologist" : "marketing";
  const eligible = reviewers.filter((reviewer) => reviewer.isReviewer && reviewer.staffRole === role);
  return eligible.length ? eligible[index % eligible.length].id : null;
}

export async function runDecisionEngine(input: DecisionInput, store: DecisionStore, reviewers: DecisionReviewer[], effects: DecisionEffects = {}, options: { dryRun?: boolean } = {}) {
  const open = await store.listOpen(); const candidates = evaluateDecisionRules(input); const written: StoredDecisionTicket[] = [];
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (candidate.evidence.action === "review_nudge") { if (!options.dryRun) await effects.sendReviewNudge?.(candidate); continue; }
    const existing = open.find((ticket) => ticket.type === candidate.type && ticket.target === candidate.target);
    const saved = await store.save(candidate, reviewerFor(candidate, reviewers, index), existing); written.push(saved);
    if (candidate.type === "technical_issue" && !options.dryRun) await effects.sendDeveloperAlert?.(candidate);
  }
  return { candidates, written };
}
