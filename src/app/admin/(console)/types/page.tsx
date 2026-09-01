import Link from "next/link";
import { listAdminStylePages } from "@/lib/admin-site-cms";

export default async function AdminTypesPage() {
  const pages = await listAdminStylePages();
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Hearing aids</p>
      <h1 className="mt-2 text-3xl font-bold">Types</h1>
      <p className="mt-2 max-w-2xl text-sm text-brand-muted">Landing copy for RIC, BTE and in-ear styles. Catalog filters stay the same.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {pages.map((page) => (
          <li key={page.id}>
            <Link href={`/admin/types/${page.id}`} className="block rounded-3xl bg-white p-5 ring-1 ring-black/5 hover:ring-brand-orange/40">
              <p className="text-lg font-bold">{page.shortName}</p>
              <p className="mt-1 text-sm text-brand-muted">{page.headline}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
