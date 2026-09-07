-- Website form submissions (hearing test, product enquiry, checkout).

create table if not exists public.form_leads (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'hearing_test',
  full_name text not null,
  phone text not null,
  phone_normalized text not null default '',
  concern_or_city text not null default '',
  product_name text not null default '',
  address text not null default '',
  page_path text not null default '',
  status text not null default 'new',
  whatsapp_patient_id text not null default '',
  whatsapp_patient_error text not null default '',
  whatsapp_staff_id text not null default '',
  whatsapp_staff_error text not null default '',
  email_sent boolean not null default false,
  email_error text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists form_leads_created_at_idx on public.form_leads (created_at desc);
create index if not exists form_leads_status_idx on public.form_leads (status);

create trigger form_leads_set_updated_at
  before update on public.form_leads
  for each row execute function public.set_updated_at();

alter table public.form_leads enable row level security;

create policy "Authenticated read form leads"
  on public.form_leads for select
  to authenticated
  using (true);

create policy "Authenticated manage form leads"
  on public.form_leads for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on public.form_leads to authenticated;

create or replace function public.submit_website_lead(
  p_source text,
  p_full_name text,
  p_phone text,
  p_phone_normalized text,
  p_concern_or_city text,
  p_product_name text,
  p_address text,
  p_page_path text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.form_leads (
    source,
    full_name,
    phone,
    phone_normalized,
    concern_or_city,
    product_name,
    address,
    page_path
  )
  values (
    coalesce(nullif(trim(p_source), ''), 'hearing_test'),
    trim(p_full_name),
    trim(p_phone),
    trim(p_phone_normalized),
    coalesce(p_concern_or_city, ''),
    coalesce(p_product_name, ''),
    coalesce(p_address, ''),
    coalesce(p_page_path, '')
  )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.record_form_lead_notify(
  p_id uuid,
  p_whatsapp_patient_id text,
  p_whatsapp_patient_error text,
  p_whatsapp_staff_id text,
  p_whatsapp_staff_error text,
  p_email_sent boolean,
  p_email_error text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.form_leads
  set
    whatsapp_patient_id = coalesce(p_whatsapp_patient_id, ''),
    whatsapp_patient_error = coalesce(p_whatsapp_patient_error, ''),
    whatsapp_staff_id = coalesce(p_whatsapp_staff_id, ''),
    whatsapp_staff_error = coalesce(p_whatsapp_staff_error, ''),
    email_sent = coalesce(p_email_sent, false),
    email_error = coalesce(p_email_error, '')
  where id = p_id;
end;
$$;

revoke all on function public.submit_website_lead(text, text, text, text, text, text, text, text) from public;
revoke all on function public.record_form_lead_notify(uuid, text, text, text, text, boolean, text) from public;
grant execute on function public.submit_website_lead(text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.record_form_lead_notify(uuid, text, text, text, text, boolean, text) to anon, authenticated;
