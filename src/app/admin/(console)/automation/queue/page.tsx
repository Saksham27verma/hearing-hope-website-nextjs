import Link from "next/link";
import { loadReviewQueue } from "@/lib/automation/admin-data";

function ageOf(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (!Number.isFinite(days) || days < 1) return "today";
  return days === 1 ? "1 day" : `${days} days`;
}

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ page_type?: string; reviewer?: string }>;
}) {
  const params = await searchParams;
  const { missingTable, pages, tickets, reviewers } = await loadReviewQueue({
    pageType: params.page_type,
    reviewerId: params.reviewer,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Automation</p>
        <h1 className="mt-2 text-3xl font-bold">Review queue</h1>
      </div>
      {missingTable ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm">Apply the SEO automation migration, then reload this page.</p>
      ) : null}
      <form className="flex flex-wrap gap-3" action="/admin/automation/queue">
        <select name="page_type" defaultValue={params.page_type ?? ""} className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-black/10">
          <option value="">All page types</option>
          {["clinic", "product", "test", "condition", "guide", "comparison", "blog", "landing"].map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select name="reviewer" defaultValue={params.reviewer ?? ""} className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-black/10">
          <option value="">All reviewers</option>
          {reviewers.map((reviewer) => (
            <option key={reviewer.id} value={reviewer.id}>
              {reviewer.name}
            </option>
          ))}
        </select>
        <button className="rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white" type="submit">
          Filter
        </button>
      </form>
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-black/5">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-brand-muted">
            <tr>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Why</th>
              <th className="px-4 py-3">Reviewer</th>
              <th className="px-4 py-3">Age</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const ticket = tickets.find((item) => item.generatedPageId === page.id || item.targetPageId === page.id);
              const reviewer = reviewers.find((person) => person.id === ticket?.assignedReviewerId);
              return (
                <tr key={page.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <Link href={`/admin/automation/queue/${page.id}`} className="font-semibold text-brand-dark hover:underline">
                      {page.title || page.slug}
                    </Link>
                    <p className="text-xs text-brand-muted">priority {page.priorityScore}</p>
                  </td>
                  <td className="px-4 py-3">{page.pageType}</td>
                  <td className="px-4 py-3">{page.status}</td>
                  <td className="px-4 py-3 text-brand-muted">{ticket?.reason || "—"}</td>
                  <td className="px-4 py-3">{reviewer?.name || "—"}</td>
                  <td className="px-4 py-3">{ageOf(page.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {pages.length ? null : <p className="px-4 py-6 text-sm text-brand-muted">Nothing is waiting for review.</p>}
      </div>
    </div>
  );
}
