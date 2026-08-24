"use client";

import { useState } from "react";
import { importProductsCsv } from "@/app/admin/actions";
import { CSV_TEMPLATE } from "@/lib/csv";

export function ImportForm() {
  const [csv, setCsv] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await importProductsCsv(csv);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`Imported ${result.created} new model${result.created === 1 ? "" : "s"} and updated ${result.updated}.`);
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hearing-aid-models-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadTemplate}
          className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold"
        >
          Download CSV template
        </button>
        <label className="cursor-pointer rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white">
          Upload CSV file
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setCsv(await file.text());
            }}
          />
        </label>
      </div>
      <textarea
        className="min-h-64 w-full rounded-2xl border border-brand-border bg-white p-4 font-mono text-xs outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20"
        placeholder="Paste CSV here, or upload a file."
        value={csv}
        onChange={(event) => setCsv(event.target.value)}
      />
      {error ? <p className="text-sm font-medium text-brand-orange">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-brand-teal">{message}</p> : null}
      <button
        type="submit"
        disabled={pending || !csv.trim()}
        className="rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
      >
        {pending ? "Importing…" : "Import models"}
      </button>
    </form>
  );
}
