import { notFound } from "next/navigation";
import { ReviewScreen } from "@/components/admin/ReviewScreen";
import { loadReviewPage } from "@/lib/automation/admin-data";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { missingTable, page, ticket } = await loadReviewPage(id);
  if (missingTable) {
    return <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm">Apply the SEO automation migration, then reload this page.</p>;
  }
  if (!page) notFound();
  return <ReviewScreen page={page} ticket={ticket} />;
}
