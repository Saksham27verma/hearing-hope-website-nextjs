import { describe, expect, it } from "vitest";
import { approvePageAsReviewer } from "./review";
import { findReviewerMarkers } from "./reviewer-markers";

function db(page: Record<string, unknown>) {
  const updates: Record<string, unknown>[] = [];
  const chain = (table: string) => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => (table === "team_members" ? { data: { id: "reviewer-1", is_reviewer: true }, error: null } : { data: page, error: null }) }) }),
    update: (patch: Record<string, unknown>) => ({ eq: () => ({ select: () => ({ single: async () => { updates.push(patch); Object.assign(page, patch); return { data: page, error: null }; } }) }) }),
  });
  return { client: { from: (table: string) => chain(table) }, updates };
}

describe("reviewer markers", () => {
  it("finds markers in text fields and FAQ items", () => {
    expect(
      findReviewerMarkers({
        body_markdown: "Prices vary by technology level. [REVIEWER: add price range]",
        faq_items: [{ question: "Is it rechargeable?", answer: "Ask us. [reviewer: verify]" }],
        title: "Widex Moment",
      }),
    ).toEqual([
      { field: "Body", text: "[REVIEWER: add price range]" },
      { field: "FAQ", text: "[reviewer: verify]" },
    ]);
  });

  it("ignores ordinary brackets and missing fields", () => {
    expect(findReviewerMarkers({ body_markdown: "See [our clinics](/clinics). A reviewer checks every page." })).toEqual([]);
  });

  it("refuses to approve a page that still has a marker, and publishes nothing", async () => {
    const page = { id: "page-1", slug: "widex-moment", page_type: "product", status: "draft", body_markdown: "Prices vary. [REVIEWER: add price range]" };
    const { client, updates } = db(page);
    let published = false;
    const result = await approvePageAsReviewer(client as never, "auth-user", "page-1", { publish: async () => { published = true; return []; } });
    expect(result).toMatchObject({ ok: false, status: 400 });
    expect(!result.ok && result.error).toContain("[REVIEWER: add price range] (Body)");
    expect(updates).toEqual([]);
    expect(published).toBe(false);
  });

  it("approves once the marker is replaced", async () => {
    const page = { id: "page-1", slug: "widex-moment", page_type: "product", status: "draft", body_markdown: "It costs about ₹1–₹2 per hearing aid." };
    const { client } = db(page);
    await expect(approvePageAsReviewer(client as never, "auth-user", "page-1", { publish: async () => [] })).resolves.toMatchObject({ ok: true, page: { status: "published" } });
  });
});
