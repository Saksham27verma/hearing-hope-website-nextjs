"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLead, updateLeadStatus } from "@/app/admin/site-actions";
import type { FormLead } from "@/lib/admin-leads";
import { cn } from "@/lib/utils";

const STATUSES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "closed", label: "Closed" },
] as const;

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function sourceLabel(source: string) {
  if (source === "checkout") return "Checkout";
  if (source === "product_enquiry") return "Product enquiry";
  return "Hearing test";
}

function notifyBadge(ok: boolean, error: string) {
  if (ok) return { label: "Sent", className: "bg-emerald-50 text-emerald-800" };
  if (error) return { label: "Failed", className: "bg-red-50 text-red-700" };
  return { label: "Pending", className: "bg-slate-100 text-slate-600" };
}

export function LeadsInbox({ items, missingTable = false }: { items: FormLead[]; missingTable?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    const result = await updateLeadStatus({ id, status });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    const result = await deleteLead(id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Enquiries</p>
      <h1 className="mt-2 text-3xl font-bold">Form submissions</h1>
      <p className="mt-2 max-w-2xl text-sm text-brand-muted">
        Hearing-test bookings, product enquiries and checkout requests. Each row is emailed to the clinic and sent on WhatsApp.
      </p>
      {missingTable ? (
        <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          The <code>form_leads</code> table is not in Supabase yet. Run{" "}
          <code>supabase/migrations/20260907120000_form_leads.sql</code> in the Supabase SQL editor so submissions appear here.
          Email and WhatsApp still send from the website form.
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {items.length === 0 && !missingTable ? (
        <p className="mt-8 rounded-3xl bg-white p-8 text-sm text-brand-muted ring-1 ring-black/5">
          No submissions yet. New requests from the homepage form will appear here instantly.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((item) => {
            const patient = notifyBadge(Boolean(item.whatsappPatientId), item.whatsappPatientError);
            const staff = notifyBadge(Boolean(item.whatsappStaffId), item.whatsappStaffError);
            const email = notifyBadge(item.emailSent, item.emailError);
            return (
              <li key={item.id} className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-brand-dark">{item.fullName}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {sourceLabel(item.source)} · {formatWhen(item.createdAt)}
                    </p>
                  </div>
                  <select
                    className="rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark"
                    value={item.status}
                    onChange={(event) => void setStatus(item.id, event.target.value)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">Phone</dt>
                    <dd className="mt-1">
                      <a className="font-semibold text-brand-dark hover:text-brand-orange" href={`tel:+${item.phoneNormalized || item.phone}`}>
                        {item.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">Concern / city</dt>
                    <dd className="mt-1 text-brand-dark">{item.concernOrCity || "—"}</dd>
                  </div>
                  {item.productName ? (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">Product</dt>
                      <dd className="mt-1 text-brand-dark">{item.productName}</dd>
                    </div>
                  ) : null}
                  {item.address ? (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">Address</dt>
                      <dd className="mt-1 text-brand-dark">{item.address}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className={cn("rounded-full px-2.5 py-1", patient.className)}>Patient WhatsApp · {patient.label}</span>
                  <span className={cn("rounded-full px-2.5 py-1", staff.className)}>Clinic WhatsApp · {staff.label}</span>
                  <span className={cn("rounded-full px-2.5 py-1", email.className)}>Email · {email.label}</span>
                </div>
                {(item.whatsappPatientError || item.whatsappStaffError || item.emailError) && (
                  <p className="mt-3 text-xs leading-5 text-red-700">
                    {[item.whatsappPatientError, item.whatsappStaffError, item.emailError].filter(Boolean).join(" · ")}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    className="text-sm font-semibold text-brand-teal hover:underline"
                    href={`https://wa.me/${item.phoneNormalized || item.phone.replace(/\D/g, "")}`}
                  >
                    WhatsApp patient
                  </a>
                  <button type="button" className="text-sm font-semibold text-red-700 hover:underline" onClick={() => void remove(item.id)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
