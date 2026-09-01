import Link from "next/link";
import { listAdminServices } from "@/lib/admin-site-cms";

export default async function AdminServicesPage() {
  const services = await listAdminServices();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Care</p>
          <h1 className="mt-2 text-3xl font-bold">Services</h1>
        </div>
        <Link href="/admin/services/new" className="rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white">
          Add service
        </Link>
      </div>
      <ul className="mt-8 grid gap-3">
        {services.map((service) => (
          <li key={service.id ?? service.slug}>
            <Link
              href={`/admin/services/${service.id || service.slug}`}
              className="flex items-center justify-between rounded-3xl bg-white p-5 ring-1 ring-black/5 hover:ring-brand-orange/40"
            >
              <span>
                <span className="block font-bold text-brand-dark">{service.shortName || service.title}</span>
                <span className="text-sm text-brand-muted">
                  {service.category}
                  {service.published ? "" : " · Hidden"}
                </span>
              </span>
              <span className="text-sm font-semibold text-brand-teal">Edit</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
