import { DECISION_THRESHOLDS as t } from "@/config/decision-thresholds";
import type { DecisionCandidate, DecisionInput } from "../types";
import { isYmylPageType } from "../types";
export function rule7NotReviewed(input: DecisionInput): DecisionCandidate[] { return input.pages.flatMap((page) => isYmylPageType(page.pageType) && !page.reviewedById ? [{ type: "refresh", target: page.id, targetPageId: page.id, priorityScore: t.medicalReviewPriority, reason: "Published YMYL page has no recorded human reviewer.", evidence: { pageType: page.pageType }, needsMedicalReview: true, suggestedPageType: page.pageType }] : []); }
