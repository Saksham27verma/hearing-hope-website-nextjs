import { DECISION_THRESHOLDS as t } from "@/config/decision-thresholds";
import type { DecisionCandidate, DecisionInput } from "../types";
import { slugFor, tokenOverlap } from "../types";
export function rule1MissingPage(input: DecisionInput): DecisionCandidate[] {
  const result: DecisionCandidate[] = [];
  for (const query of input.searchQueries) {
    if (query.impressions < t.missingPageImpressions) continue;
    const best = input.pages.reduce((score, page) => Math.max(score, tokenOverlap(query.query, `${page.slug} ${page.title}`)), 0);
    if (query.position <= t.missingPagePosition && best >= 0.6) continue;
    const existing = result.find((candidate) => tokenOverlap(candidate.targetKeywords?.[0] ?? "", query.query) >= 0.6);
    const priority = query.impressions * (1 - query.ctr);
    if (existing) { existing.priorityScore = Math.max(existing.priorityScore, priority); continue; }
    result.push({ type: "new_page", target: slugFor(query.query), priorityScore: priority, reason: "High-impression query has no strong answer page.", evidence: { query, bestPageOverlap: best }, suggestedSlug: slugFor(query.query), suggestedPageType: "guide", targetKeywords: [query.query] });
  }
  return result;
}
