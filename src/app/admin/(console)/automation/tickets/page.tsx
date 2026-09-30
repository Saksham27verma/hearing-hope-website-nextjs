import { TicketBoard } from "@/components/admin/TicketBoard";
import { loadTickets } from "@/lib/automation/admin-data";

export default async function TicketsPage() {
  const { missingTable, tickets } = await loadTickets();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Automation</p>
        <h1 className="mt-2 text-3xl font-bold">Tickets</h1>
      </div>
      {missingTable ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm">Apply the SEO automation migration, then reload this page.</p>
      ) : (
        <TicketBoard tickets={tickets} />
      )}
    </div>
  );
}
