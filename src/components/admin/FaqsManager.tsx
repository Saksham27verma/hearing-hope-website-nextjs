"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFaq, saveFaq } from "@/app/admin/site-actions";
import { adminField, adminLabel } from "@/components/admin/ui";
import type { CmsFaq } from "@/lib/site-cms/types";

export function FaqsManager({ items }: { items: CmsFaq[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(items);
  const [error, setError] = useState<string | null>(null);

  async function persist(item: CmsFaq, index: number) {
    if (!item.question.trim()) return;
    const result = await saveFaq({
      id: item.id,
      question: item.question,
      answer: item.answer,
      page: item.page,
      published: item.published,
      sortOrder: index + 1,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRows((current) => current.map((row, i) => (i === index ? { ...item, id: result.id } : row)));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Content</p>
        <h1 className="mt-2 text-3xl font-bold">FAQs</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">Questions shown on the homepage and hearing-aids page.</p>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <ul className="space-y-4">
        {rows.map((item, index) => (
          <li key={item.id ?? `new-${index}`} className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
            <label>
              <span className={adminLabel}>Question</span>
              <input
                className={adminField}
                value={item.question}
                onChange={(e) => setRows((current) => current.map((row, i) => (i === index ? { ...row, question: e.target.value } : row)))}
                onBlur={() => void persist(rows[index], index)}
              />
            </label>
            <label className="mt-3 block">
              <span className={adminLabel}>Answer</span>
              <textarea
                className={adminField}
                rows={3}
                value={item.answer}
                onChange={(e) => setRows((current) => current.map((row, i) => (i === index ? { ...row, answer: e.target.value } : row)))}
                onBlur={() => void persist(rows[index], index)}
              />
            </label>
            <div className="mt-3 flex items-center justify-between gap-3">
              <select
                className={adminField}
                value={item.page}
                onChange={(e) => {
                  const next = { ...rows[index], page: e.target.value as CmsFaq["page"] };
                  setRows((current) => current.map((row, i) => (i === index ? next : row)));
                  void persist(next, index);
                }}
              >
                <option value="all">All pages</option>
                <option value="home">Home</option>
                <option value="hearing-aids">Hearing aids</option>
              </select>
              <button
                type="button"
                className="text-sm font-semibold text-red-600"
                onClick={async () => {
                  if (item.id) await deleteFaq(item.id);
                  setRows((current) => current.filter((_, i) => i !== index));
                  router.refresh();
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="text-sm font-semibold text-brand-teal"
        onClick={() => setRows((current) => [...current, { question: "", answer: "", page: "all", published: true, sortOrder: current.length + 1 }])}
      >
        Add FAQ
      </button>
    </div>
  );
}
