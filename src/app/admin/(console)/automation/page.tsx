import { loadSignals } from "@/lib/automation/admin-data";

export default async function SignalsPage() {
  const data = await loadSignals();
  const cards = data.missingTable
    ? []
    : [
        ["Organic clicks, 28 days", String(data.clicks)],
        ["Google calls, 28 days", String(data.calls)],
        ["AI citation rate", `${data.citationRate}%`],
        ["Pending reviews", String(data.pending)],
        ["LLM requests today", `${data.llmRequests} / ${data.llmCap}`],
      ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Automation</p>
        <h1 className="mt-2 text-3xl font-bold">Signals</h1>
      </div>
      {data.missingTable ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm">Apply the SEO automation migration, then reload this page.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map(([label, value]) => (
              <article key={label} className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">{label}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </article>
            ))}
          </div>
          <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-black/5">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-brand-muted">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Started</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((job) => (
                  <tr key={String(job.id)} className="border-t border-black/5">
                    <td className="px-4 py-3">{String(job.job_name ?? "")}</td>
                    <td className="px-4 py-3">{String(job.status ?? "")}</td>
                    <td className="px-4 py-3">{String(job.items_processed ?? 0)}</td>
                    <td className="px-4 py-3">{String(job.started_at ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.jobs.length ? null : <p className="px-4 py-6 text-sm text-brand-muted">No jobs have run yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
