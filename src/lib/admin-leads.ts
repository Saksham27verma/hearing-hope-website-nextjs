import { requireAdmin } from "@/lib/admin";

export type FormLead = {
  id: string;
  source: string;
  fullName: string;
  phone: string;
  phoneNormalized: string;
  concernOrCity: string;
  productName: string;
  address: string;
  pagePath: string;
  status: string;
  whatsappPatientId: string;
  whatsappPatientError: string;
  whatsappStaffId: string;
  whatsappStaffError: string;
  emailSent: boolean;
  emailError: string;
  notes: string;
  createdAt: string;
};

function mapLead(row: Record<string, unknown>): FormLead {
  return {
    id: String(row.id ?? ""),
    source: String(row.source ?? "hearing_test"),
    fullName: String(row.full_name ?? ""),
    phone: String(row.phone ?? ""),
    phoneNormalized: String(row.phone_normalized ?? ""),
    concernOrCity: String(row.concern_or_city ?? ""),
    productName: String(row.product_name ?? ""),
    address: String(row.address ?? ""),
    pagePath: String(row.page_path ?? ""),
    status: String(row.status ?? "new"),
    whatsappPatientId: String(row.whatsapp_patient_id ?? ""),
    whatsappPatientError: String(row.whatsapp_patient_error ?? ""),
    whatsappStaffId: String(row.whatsapp_staff_id ?? ""),
    whatsappStaffError: String(row.whatsapp_staff_error ?? ""),
    emailSent: Boolean(row.email_sent),
    emailError: String(row.email_error ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

export async function listAdminLeads(): Promise<{ items: FormLead[]; missingTable: boolean; error: string | null }> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("form_leads").select("*").order("created_at", { ascending: false });
  if (error) {
    const missingTable = /does not exist|schema cache|Could not find the table/i.test(error.message);
    if (!missingTable) console.error("Admin load form_leads", error.message);
    return { items: [], missingTable, error: error.message };
  }
  return { items: ((data ?? []) as Record<string, unknown>[]).map(mapLead), missingTable: false, error: null };
}
