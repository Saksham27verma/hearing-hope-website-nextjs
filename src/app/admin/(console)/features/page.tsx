import Link from "next/link";
import { listAdminFeaturePages } from "@/lib/admin-site-cms";

export default async function AdminFeaturesPage() {
  const pages = await listAdminFeaturePages();
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Hearing aids</p>
      <h1 className="mt-2 text-3xl font-bold">Features</h1>
      <p className="mt-2 max-w-2xl text-sm text-brand-muted">Landing copy for rechargeable, Bluetooth, invisible and other filters.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {pages.map((page) => (
          <li key={page.id}>
            <Link href={`/admin/features/${page.id}`} className="block rounded-3xl bg-white p-5 ring-1 ring-black/5 hover:ring-brand-orange/40">
              <p className="text-lg font-bold">{page.label}</p>
              <p className="mt-1 text-sm text-brand-muted">{page.headline}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
