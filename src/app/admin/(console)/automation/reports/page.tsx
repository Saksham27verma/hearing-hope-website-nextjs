import { requireAdmin } from "@/lib/admin";

export default async function AutomationReportsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("automation_reports").select("id,report_type,period_start,period_end,narrative,created_at").order("created_at", { ascending: false }).limit(20);
  return <div className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Automation</p><h1 className="mt-2 text-3xl font-bold">Reports</h1></div>{error ? <p className="rounded-2xl bg-amber-50 p-4 text-sm">Apply the reporting migration to view report snapshots.</p> : <div className="space-y-3">{(data ?? []).map((report) => <article key={String(report.id)} className="rounded-3xl bg-white p-5 ring-1 ring-black/5"><p className="font-semibold capitalize">{String(report.report_type)} report · {String(report.period_start)} to {String(report.period_end)}</p><p className="mt-2 text-sm text-brand-muted">{String(report.narrative ?? "") || "Weekly metric summary"}</p></article>)}{data?.length ? null : <p className="rounded-2xl bg-white p-5 text-sm text-brand-muted">No report snapshots yet.</p>}</div>}</div>;
}
