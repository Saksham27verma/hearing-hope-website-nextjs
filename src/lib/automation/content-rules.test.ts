import { describe, expect, it } from "vitest";
import {
  approvalAuthDecision,
  bearerMatches,
  buildAutomationPatch,
  buildCreateRow,
  changedReviewFields,
  decodeCursor,
  encodeCursor,
  normalizeQuestion,
  parsePastedJson,
  shouldTrackReviewEdits,
} from "@/lib/automation/content-rules";

describe("content page rules", () => {
  it("creates an AI draft and drops reviewer fields", () => {
    const built = buildCreateRow(
      {
        slug: "bera-test",
        page_type: "test",
        status: "published",
        meta_title: "BERA test",
        reviewed_by_id: "person-1",
        reviewed_at: "2026-01-01T00:00:00Z",
        generation_meta: { source: "human", provider: "gemini" },
      },
      "ai",
    );
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.row.status).toBe("draft");
    expect(built.row.reviewed_by_id).toBeNull();
    expect(built.row.reviewed_at).toBeNull();
    expect(built.row.generation_meta.source).toBe("ai");
    expect(built.row.generation_meta.provider).toBe("gemini");
  });

  it("rejects meta fields over the limit", () => {
    const built = buildCreateRow({ slug: "too-long", page_type: "guide", meta_title: "x".repeat(61) }, "human");
    expect(built.ok).toBe(false);
  });

  it("refuses review fields and published status on patch", () => {
    const existing = { slug: "bera-test", slug_locked: false, status: "draft" as const };
    expect(buildAutomationPatch(existing, { reviewed_by_id: "person-1" }).ok).toBe(false);
    expect(buildAutomationPatch(existing, { status: "published" }).ok).toBe(false);
    expect(buildAutomationPatch(existing, { status: "approved" }).ok).toBe(false);
    const allowed = buildAutomationPatch(existing, { status: "in_review", title: "BERA" });
    expect(allowed.ok).toBe(true);
  });

  it("keeps a published slug fixed", () => {
    const result = buildAutomationPatch(
      { slug: "bera-test", slug_locked: true, status: "published" },
      { slug: "renamed" },
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a bearer token on approve", () => {
    expect(approvalAuthDecision("Bearer secret")).toBe("reject-bearer");
    expect(approvalAuthDecision(null)).toBe("require-session");
    expect(bearerMatches("Bearer secret", "secret")).toBe(true);
    expect(bearerMatches("Bearer other", "secret")).toBe(false);
  });

  it("records reviewer edits field by field", () => {
    const changes = changedReviewFields(
      { title: "Old", meta_title: "Same", faq_items: [{ question: "Q", answer: "A" }] },
      { title: "New", meta_title: "Same", faq_items: [{ question: "Q", answer: "B" }] },
    );
    expect(changes.map((change) => change.field)).toEqual(["title", "faq_items"]);
    expect(shouldTrackReviewEdits({ source: "ai" })).toBe(true);
    expect(shouldTrackReviewEdits({ source: "human" })).toBe(false);
  });

  it("normalises questions and pasted JSON", () => {
    expect(normalizeQuestion("  What is a BERA test? ")).toBe("what is a bera test");
    const parsed = parsePastedJson("```json\n{\"title\":\"BERA\"}\n```");
    expect(parsed.ok).toBe(true);
    expect(parsePastedJson("not json").ok).toBe(false);
  });

  it("round-trips the list cursor", () => {
    const cursor = encodeCursor("2026-09-29T08:00:00.000Z", "abc");
    expect(decodeCursor(cursor)).toEqual({ createdAt: "2026-09-29T08:00:00.000Z", id: "abc" });
  });
});
