import Link from "next/link";
import { listAdminPages } from "@/lib/admin-site-cms";
import { LinkPendingHint } from "@/components/ui/LinkPendingHint";

const labels: Record<string, string> = {
  home: "Home",
  about: "About",
  clinics: "Clinics intro",
  services: "Services intro",
  "hearing-aids": "Hearing aids intro",
  pricing: "Pricing",
  blog: "Blog index",
};

export default async function AdminPagesIndex() {
  const pages = await listAdminPages();
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Website</p>
      <h1 className="mt-2 text-3xl font-bold">Pages</h1>
      <p className="mt-2 max-w-2xl text-sm text-brand-muted">Edit the copy and photos on each public page.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {pages.map((page) => (
          <li key={page.id}>
            <Link href={`/admin/pages/${page.id}`} className="flex items-start justify-between gap-3 rounded-3xl bg-white p-5 ring-1 ring-black/5 transition hover:ring-brand-orange/40">
              <span>
                <p className="text-lg font-bold text-brand-dark">{labels[page.id]}</p>
                <p className="mt-1 line-clamp-2 text-sm text-brand-muted">{page.metaDescription || page.fields && "title" in page.fields ? String((page.fields as { title?: string }).title ?? "") : ""}</p>
              </span>
              <LinkPendingHint className="mt-1 text-brand-orange" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
