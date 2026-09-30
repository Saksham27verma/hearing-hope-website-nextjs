"use client";

import { useState } from "react";
import { saveManualAiChecks } from "@/app/admin/automation-actions";
import { adminField } from "@/components/admin/ui";

const ENGINES = [
  ["chatgpt", "ChatGPT"],
  ["perplexity", "Perplexity"],
  ["google_ai_mode", "Google AI Mode"],
  ["claude", "Claude"],
] as const;

type RowState = { cited: boolean; competitors: string };

export function AiCheckForm({ questions }: { questions: { id: string; question: string; category: string }[] }) {
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function key(questionId: string, engine: string) {
    return `${questionId}:${engine}`;
  }

  function update(id: string, patch: Partial<RowState>) {
    setRows((current) => ({
      ...current,
      [id]: {
        cited: patch.cited ?? current[id]?.cited ?? false,
        competitors: patch.competitors ?? current[id]?.competitors ?? "",
      },
    }));
  }

  async function onSave() {
    setPending(true);
    setMessage(null);
    const payload = questions.flatMap((question) =>
      ENGINES.map(([engine]) => {
        const row = rows[key(question.id, engine)];
        return {
          question: question.question,
          engine,
          cited: Boolean(row?.cited),
          competitors: row?.competitors ?? "",
        };
      }),
    );
    const result = await saveManualAiChecks({ rows: payload });
    setPending(false);
    setMessage(result.ok ? "Saved this month's manual check." : result.error);
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <article key={question.id} className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">{question.category}</p>
              <h2 className="mt-1 font-bold">{question.question}</h2>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-brand-orange"
              onClick={() => navigator.clipboard.writeText(question.question)}
            >
              Copy
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {ENGINES.map(([engine, label]) => {
              const id = key(question.id, engine);
              const row = rows[id];
              return (
                <label key={engine} className="rounded-2xl bg-brand-surface p-3 text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <input type="checkbox" checked={Boolean(row?.cited)} onChange={(event) => update(id, { cited: event.target.checked })} />
                    {label}: we were cited
                  </span>
                  <input
                    className={`${adminField} mt-2`}
                    placeholder="Competitor domains, comma separated"
                    value={row?.competitors ?? ""}
                    onChange={(event) => update(id, { competitors: event.target.value })}
                  />
                </label>
              );
            })}
          </div>
        </article>
      ))}
      {message ? <p className="text-sm">{message}</p> : null}
      <button type="button" disabled={pending} onClick={onSave} className="rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white">
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
