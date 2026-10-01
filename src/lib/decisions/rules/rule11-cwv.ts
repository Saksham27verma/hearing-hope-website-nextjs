import type { DecisionCandidate, DecisionInput } from "../types";
export function rule11CwvRegression(input: DecisionInput): DecisionCandidate[] { return input.cwvRegressions.map((row) => ({ type: "technical_issue", target: row.url, priorityScore: 900, reason: "Core Web Vitals regression requires a technical fix.", evidence: row })); }
