import { DECISION_THRESHOLDS as t } from "@/config/decision-thresholds";
import type { DecisionCandidate, DecisionInput } from "../types";
import { slugFor, tokenOverlap } from "../types";
export function rule2QuestionWithoutAnswer(input: DecisionInput): DecisionCandidate[] {
  return input.questions.flatMap((question) => {
    if (question.source !== "staff" && question.seenCount < t.questionSeenCount) return [];
    const best = input.pages.map((page) => ({ page, overlap: Math.max(tokenOverlap(question.question, page.bodyMarkdown), ...page.faqItems.map((faq) => tokenOverlap(question.question, faq.question))) })).sort((a, b) => b.overlap - a.overlap)[0];
    if (best?.overlap >= t.questionAnswerOverlap) return [];
    return [{ type: best ? "add_faq" : "new_page", target: best?.page.id ?? slugFor(question.question), targetPageId: best?.page.id, suggestedSlug: best ? undefined : slugFor(question.question), suggestedPageType: best ? undefined : "guide", targetKeywords: [question.question], priorityScore: question.source === "staff" ? 500 : question.seenCount * 100, reason: "Repeated patient question has no matching answer.", evidence: { question, bestOverlap: best?.overlap ?? 0 } }];
  });
}
