import { normalizeQuestion } from "@/lib/automation/content-rules";

type ExistingQuestion = {
  id: string;
  seen_count: number | null;
  clinic_id: string | null;
};

type StaffQuestionInput = {
  question: string;
  clinicId: string;
  note: string;
};

export function planStaffQuestionWrite(
  input: StaffQuestionInput,
  existing: ExistingQuestion | null,
  now = new Date().toISOString(),
) {
  const question = input.question.trim();
  const normalizedQuestion = normalizeQuestion(question);
  if (normalizedQuestion.length < 8) {
    return { ok: false as const, error: "Write a full question." };
  }

  const row = {
    question,
    normalized_question: normalizedQuestion,
    source: "staff",
    clinic_id: input.clinicId || existing?.clinic_id || null,
    note: input.note.trim(),
    last_seen_at: now,
  };

  if (existing) {
    return {
      ok: true as const,
      mode: "update" as const,
      id: existing.id,
      row: { ...row, seen_count: Number(existing.seen_count ?? 0) + 1 },
    };
  }

  return {
    ok: true as const,
    mode: "insert" as const,
    row: { ...row, volume_hint: 0, seen_count: 1, first_seen_at: now },
  };
}
