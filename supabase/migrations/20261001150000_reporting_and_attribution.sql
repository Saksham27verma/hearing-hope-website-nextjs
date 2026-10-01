alter table public.form_leads
  add column if not exists how_did_you_hear text not null default 'other'
  check (how_did_you_hear in ('google_search', 'google_maps', 'chatgpt_ai', 'referral', 'walk_in', 'social', 'other'));

create table if not exists public.automation_reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null check (report_type in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  metrics jsonb not null default '{}'::jsonb,
  narrative text not null default '',
  html text not null default '',
  created_at timestamptz not null default now(),
  unique (report_type, period_start, period_end)
);

create or replace function public.submit_website_lead(
  p_source text, p_full_name text, p_phone text, p_phone_normalized text,
  p_concern_or_city text, p_product_name text, p_address text, p_page_path text,
  p_how_did_you_hear text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  insert into public.form_leads (source, full_name, phone, phone_normalized, concern_or_city, product_name, address, page_path, how_did_you_hear)
  values (coalesce(nullif(trim(p_source), ''), 'hearing_test'), trim(p_full_name), trim(p_phone), trim(p_phone_normalized), coalesce(p_concern_or_city, ''), coalesce(p_product_name, ''), coalesce(p_address, ''), coalesce(p_page_path, ''), p_how_did_you_hear)
  returning id into new_id;
  return new_id;
end;
$$;

grant execute on function public.submit_website_lead(text, text, text, text, text, text, text, text, text) to anon, authenticated;
alter table public.automation_reports enable row level security;
create policy "Authenticated read automation reports" on public.automation_reports for select to authenticated using (true);
create policy "Authenticated manage automation reports" on public.automation_reports for all to authenticated using (true) with check (true);
