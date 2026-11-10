// The draft writer leaves `[REVIEWER: …]` notes (e.g. "add price range", "verify")
// where a human has to supply or check something. None may reach the public site.
const MARKER = /\[\s*REVIEWER\s*:[^\]]*\]/gi;

export type MarkerFields = {
  title?: unknown;
  meta_title?: unknown;
  meta_description?: unknown;
  answer_summary?: unknown;
  body_markdown?: unknown;
  faq_items?: unknown;
};

const LABELS: Record<keyof MarkerFields, string> = {
  title: "Title",
  meta_title: "Meta title",
  meta_description: "Meta description",
  answer_summary: "Answer summary",
  body_markdown: "Body",
  faq_items: "FAQ",
};

export type ReviewerMarker = { field: string; text: string };

function asText(value: unknown) {
  if (value == null) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function findReviewerMarkers(fields: MarkerFields): ReviewerMarker[] {
  return (Object.keys(LABELS) as (keyof MarkerFields)[]).flatMap((key) =>
    (asText(fields[key]).match(MARKER) ?? []).map((text) => ({ field: LABELS[key], text })),
  );
}

export function reviewerMarkerError(markers: ReviewerMarker[]) {
  const list = markers.map((marker) => `${marker.text} (${marker.field})`).join(", ");
  return `Replace the reviewer notes before approving: ${list}.`;
}
