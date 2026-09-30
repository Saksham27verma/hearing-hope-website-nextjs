import { describe, expect, it } from "vitest";
import { planStaffQuestionWrite } from "@/lib/automation/questions";

describe("staff question writes", () => {
  it("creates a staff-sourced question with its normalised key", () => {
    const result = planStaffQuestionWrite(
      { question: " What is a BERA test? ", clinicId: "clinic-1", note: "Asked at reception" },
      null,
      "2026-09-30T00:00:00.000Z",
    );
    expect(result).toMatchObject({
      ok: true,
      mode: "insert",
      row: {
        source: "staff",
        normalized_question: "what is a bera test",
        seen_count: 1,
        clinic_id: "clinic-1",
      },
    });
  });

  it("increments a duplicate question instead of relying on a missing RPC", () => {
    const result = planStaffQuestionWrite(
      { question: "What is a BERA test?", clinicId: "", note: "" },
      { id: "question-1", seen_count: 3, clinic_id: "clinic-1" },
      "2026-09-30T00:00:00.000Z",
    );
    expect(result).toMatchObject({
      ok: true,
      mode: "update",
      id: "question-1",
      row: { source: "staff", seen_count: 4, clinic_id: "clinic-1" },
    });
  });
});
