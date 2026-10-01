import type { DecisionCandidate, DecisionInput } from "../types";
import { rule1MissingPage } from "./rule1-missing-page";
import { rule2QuestionWithoutAnswer } from "./rule2-question";
import { rule3StalePage } from "./rule3-stale";
import { rule4PositionDrop } from "./rule4-position-drop";
import { rule5LowCtr } from "./rule5-low-ctr";
import { rule6SchemaGap } from "./rule6-schema-gap";
import { rule7NotReviewed } from "./rule7-not-reviewed";
import { rule8CompetitorCoverage } from "./rule8-competitor";
import { rule9AiVisibilityGap } from "./rule9-ai-visibility";
import { rule10ReviewPipeline } from "./rule10-review-pipeline";
import { rule11CwvRegression } from "./rule11-cwv";
import { rule12GbpPostCadence } from "./rule12-gbp-cadence";
export { rule1MissingPage, rule2QuestionWithoutAnswer, rule3StalePage, rule4PositionDrop, rule5LowCtr, rule6SchemaGap, rule7NotReviewed, rule8CompetitorCoverage, rule9AiVisibilityGap, rule10ReviewPipeline, rule11CwvRegression, rule12GbpPostCadence };
const RULES: Array<(input: DecisionInput) => DecisionCandidate[]> = [rule1MissingPage, rule2QuestionWithoutAnswer, rule3StalePage, rule4PositionDrop, rule5LowCtr, rule6SchemaGap, rule7NotReviewed, rule8CompetitorCoverage, rule9AiVisibilityGap, rule10ReviewPipeline, rule11CwvRegression, rule12GbpPostCadence];
export function evaluateDecisionRules(input: DecisionInput) { return RULES.flatMap((rule) => rule(input)); }
