"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveContentDraft,
  dismissContentDraft,
  requestContentChanges,
  saveContentDraft,
  validateContentJsonLd,
} from "@/app/admin/automation-actions";
import { adminField, adminLabel } from "@/components/admin/ui";
import type { QueuePage, QueueTicket } from "@/lib/automation/admin-data";

function previewBody(markdown: string) {
  return markdown.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
}

export function ReviewScreen({ page, ticket }: { page: QueuePage; ticket: QueueTicket | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: page.title,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    canonicalUrl: page.canonicalUrl,
    answerSummary: page.answerSummary,
    bodyMarkdown: page.bodyMarkdown,
    faqItems: JSON.stringify(page.faqItems ?? [], null, 2),
    sources: JSON.stringify(page.sources ?? [], null, 2),
    internalLinks: Array.isArray(page.internalLinks) ? page.internalLinks.map(String).join("\n") : "",
    jsonLd: JSON.stringify(page.jsonLd ?? {}, null, 2),
  });
  const [notes, setNotes] = useState(page.reviewNotes);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [schemaErrors, setSchemaErrors] = useState<string[] | null>(null);

  function parsedFields() {
    let faqItems: unknown;
    let sources: unknown;
    let jsonLd: unknown;
    try {
      faqItems = JSON.parse(form.faqItems || "[]");
      sources = JSON.parse(form.sources || "[]");
      jsonLd = JSON.parse(form.jsonLd || "{}");
    } catch {
      return null;
    }
    return {
      id: page.id,
      title: form.title,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      canonicalUrl: form.canonicalUrl,
      answerSummary: form.answerSummary,
      bodyMarkdown: form.bodyMarkdown,
      faqItems,
      sources,
      internalLinks: form.internalLinks.split("\n").map((item) => item.trim()).filter(Boolean),
      jsonLd,
    };
  }

  async function onApprove() {
    const payload = parsedFields();
    if (!payload) {
      setError("FAQ, sources, and JSON-LD must be valid JSON.");
      return;
    }
    setPending("approve");
    setError(null);
    const saved = await saveContentDraft(payload);
    if (!saved.ok) {
      setPending(null);
      setError(saved.error);
      return;
    }
    const result = await approveContentDraft(page.id);
    setPending(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/automation/queue");
    router.refresh();
  }

  async function onChanges() {
    setPending("changes");
    setError(null);
    const result = await requestContentChanges(page.id, notes);
    setPending(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/automation/queue");
    router.refresh();
  }

  async function onDismiss() {
    setPending("dismiss");
    const result = await dismissContentDraft(page.id);
    setPending(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/automation/queue");
    router.refresh();
  }

  async function onValidate() {
    try {
      const result = await validateContentJsonLd(JSON.parse(form.jsonLd || "{}"));
      setSchemaErrors(result.errors);
    } catch {
      setSchemaErrors(["JSON-LD is not valid JSON."]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Review</p>
        <h1 className="mt-2 text-3xl font-bold">{form.title || page.slug}</h1>
        <p className="mt-2 text-sm text-brand-muted">
          {page.pageType} · {page.status} · priority {page.priorityScore}
        </p>
      </div>
      {ticket ? (
        <section className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
          <h2 className="text-lg font-bold">Why this is here</h2>
          <p className="mt-2 text-sm text-brand-dark">{ticket.reason || "No ticket reason yet."}</p>
          <pre className="mt-3 max-h-40 overflow-auto rounded-2xl bg-brand-surface p-3 text-xs text-brand-muted">
            {JSON.stringify(ticket.evidence ?? {}, null, 2)}
          </pre>
        </section>
      ) : null}
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Draft</p>
          <h2 className="mt-3 text-2xl font-bold">{form.title || "Untitled"}</h2>
          {form.answerSummary ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-brand-dark">{form.answerSummary}</p>
          ) : null}
          <div className="mt-4 space-y-3 text-sm leading-6 text-brand-dark">
            {previewBody(form.bodyMarkdown).map((block) => (
              <p key={block.slice(0, 40)}>{block}</p>
            ))}
          </div>
        </article>
        <form className="space-y-3 rounded-3xl bg-white p-6 ring-1 ring-black/5" onSubmit={(event) => event.preventDefault()}>
          <label>
            <span className={adminLabel}>Title</span>
            <input className={adminField} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Meta title ({form.metaTitle.length}/60)</span>
            <input className={adminField} value={form.metaTitle} maxLength={60} onChange={(event) => setForm({ ...form, metaTitle: event.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Meta description ({form.metaDescription.length}/160)</span>
            <textarea className={adminField} rows={3} value={form.metaDescription} maxLength={160} onChange={(event) => setForm({ ...form, metaDescription: event.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Answer summary</span>
            <textarea className={adminField} rows={3} value={form.answerSummary} onChange={(event) => setForm({ ...form, answerSummary: event.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Body</span>
            <textarea className={adminField} rows={8} value={form.bodyMarkdown} onChange={(event) => setForm({ ...form, bodyMarkdown: event.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Internal link slugs</span>
            <textarea className={adminField} rows={3} value={form.internalLinks} onChange={(event) => setForm({ ...form, internalLinks: event.target.value })} />
          </label>
          <details className="rounded-2xl bg-brand-surface p-3">
            <summary className="cursor-pointer text-sm font-semibold">JSON-LD</summary>
            <textarea className={`${adminField} mt-3 font-mono text-xs`} rows={8} value={form.jsonLd} onChange={(event) => setForm({ ...form, jsonLd: event.target.value })} />
            <button type="button" className="mt-3 text-sm font-semibold text-brand-orange" onClick={onValidate}>
              Validate
            </button>
            {schemaErrors ? (
              <ul className="mt-2 text-sm text-brand-dark">
                {schemaErrors.length ? schemaErrors.map((item) => <li key={item}>{item}</li>) : <li>Schema looks complete.</li>}
              </ul>
            ) : null}
          </details>
          <label>
            <span className={adminLabel}>Changes requested</span>
            <textarea className={adminField} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" disabled={Boolean(pending)} onClick={onApprove} className="rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white">
              {pending === "approve" ? "Approving…" : "Approve"}
            </button>
            <button type="button" disabled={Boolean(pending)} onClick={onChanges} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold ring-1 ring-black/10">
              Request changes
            </button>
            <button type="button" disabled={Boolean(pending)} onClick={onDismiss} className="rounded-full px-5 py-2.5 text-sm font-semibold text-red-600">
              Dismiss
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
