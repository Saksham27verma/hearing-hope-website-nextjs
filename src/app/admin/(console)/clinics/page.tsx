import Link from "next/link";
import { listAdminClinics } from "@/lib/admin-site-cms";
import { LinkPendingHint } from "@/components/ui/LinkPendingHint";

export default async function AdminClinicsPage() {
  const clinics = await listAdminClinics();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Locations</p>
          <h1 className="mt-2 text-3xl font-bold">Clinics</h1>
        </div>
        <Link href="/admin/clinics/new" className="rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white">
          Add clinic
        </Link>
      </div>
      <ul className="mt-8 grid gap-3">
        {clinics.map((clinic) => (
          <li key={clinic.id ?? clinic.slug}>
            <Link
              href={`/admin/clinics/${clinic.id || clinic.slug}`}
              className="flex items-center justify-between rounded-3xl bg-white p-5 ring-1 ring-black/5 hover:ring-brand-orange/40"
            >
              <span>
                <span className="block font-bold text-brand-dark">{clinic.name}</span>
                <span className="text-sm text-brand-muted">
                  {clinic.city}
                  {clinic.comingSoon ? " · Coming soon" : ""}
                  {clinic.published ? "" : " · Hidden"}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-teal">
                Edit
                <LinkPendingHint />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
