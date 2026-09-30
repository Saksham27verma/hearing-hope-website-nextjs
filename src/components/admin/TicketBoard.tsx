"use client";

import { useState } from "react";
import { pasteTicketResponse, setTicketStatus } from "@/app/admin/automation-actions";
import { adminField, adminLabel } from "@/components/admin/ui";
import type { QueueTicket } from "@/lib/automation/admin-data";

export function TicketBoard({ tickets }: { tickets: QueueTicket[] }) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pastes, setPastes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  async function run(id: string, action: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(id);
    setError(null);
    const result = await action();
    setPending(null);
    if (!result.ok) setError(result.error ?? "Could not update the ticket.");
  }

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {tickets.length ? null : <p className="text-sm text-brand-muted">No tickets yet.</p>}
      {tickets.map((ticket) => (
        <article key={ticket.id} className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                {ticket.type} · {ticket.status} · {ticket.priorityScore}
              </p>
              <h2 className="mt-1 font-bold">{ticket.reason || ticket.suggestedSlug || "Untitled ticket"}</h2>
              {ticket.lastError ? <p className="mt-1 text-sm text-red-700">{ticket.lastError}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-black/10"
                disabled={pending === ticket.id}
                onClick={() => run(ticket.id, () => setTicketStatus(ticket.id, "open"))}
              >
                Generate now
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600"
                disabled={pending === ticket.id}
                onClick={() => run(ticket.id, () => setTicketStatus(ticket.id, "dismissed"))}
              >
                Dismiss
              </button>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="text-sm font-semibold text-brand-orange"
              onClick={async () => {
                await navigator.clipboard.writeText(`${ticket.briefSystemPrompt}\n\n---\n\n${ticket.briefUserPrompt}`);
                setCopied(ticket.id);
              }}
            >
              {copied === ticket.id ? "Brief copied" : "Copy brief"}
            </button>
            <label className="mt-3 block">
              <span className={adminLabel}>Paste response</span>
              <textarea
                className={adminField}
                rows={4}
                value={pastes[ticket.id] ?? ""}
                onChange={(event) => setPastes({ ...pastes, [ticket.id]: event.target.value })}
              />
            </label>
            <button
              type="button"
              className="mt-2 text-sm font-semibold"
              disabled={pending === ticket.id}
              onClick={() => run(ticket.id, () => pasteTicketResponse(ticket.id, pastes[ticket.id] ?? ""))}
            >
              Save pasted response
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
