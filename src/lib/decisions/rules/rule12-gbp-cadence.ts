import { DECISION_THRESHOLDS as t } from "@/config/decision-thresholds";
import type { DecisionCandidate, DecisionInput } from "../types";
export function rule12GbpPostCadence(input: DecisionInput): DecisionCandidate[] { return input.clinics.flatMap((clinic) => !clinic.lastPostAt || (input.now.getTime() - new Date(clinic.lastPostAt).getTime()) / 864e5 > t.gbpPostMaxDays ? [{ type: "gbp_post", target: clinic.id, targetClinicId: clinic.id, priorityScore: 200, reason: "Clinic has no recent GBP post.", evidence: { lastPostAt: clinic.lastPostAt, clinic: clinic.name } }] : []); }
