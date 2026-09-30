-- SEO automation: content drafts, tickets, signals, and reviewer fields.
-- Existing catalog tables stay. content_pages is the draft/publish record for
-- automation, optionally linked back to a blog post, product, service, or clinic.

alter table public.team_members
  add column if not exists email text not null default '',
  add column if not exists telegram_chat_id text,
  add column if not exists telegram_link_code text,
  add column if not exists is_reviewer boolean not null default false,
  add column if not exists same_as_urls text[] not null default '{}',
  add column if not exists auth_user_id uuid,
  add column if not exists staff_role text;

alter table public.team_members
  drop constraint if exists team_members_staff_role_check;

alter table public.team_members
  add constraint team_members_staff_role_check
  check (staff_role is null or staff_role in ('audiologist', 'clinic_manager', 'admin', 'marketing'));

create unique index if not exists team_members_auth_user_id_idx
  on public.team_members (auth_user_id)
  where auth_user_id is not null;

create unique index if not exists team_members_telegram_link_code_idx
  on public.team_members (telegram_link_code)
  where telegram_link_code is not null;

update public.team_members
set telegram_link_code = encode(gen_random_bytes(9), 'hex')
where telegram_link_code is null;

alter table public.team_members
  alter column telegram_link_code set default encode(gen_random_bytes(9), 'hex');

alter table public.clinics
  add column if not exists street text not null default '',
  add column if not exists locality text not null default '',
  add column if not exists state text not null default '',
  add column if not exists postal_code text not null default '',
  add column if not exists country text not null default 'IN',
  add column if not exists whatsapp text not null default '',
  add column if not exists email text not null default '',
  add column if not exists opening_hours jsonb not null default '{}'::jsonb,
  add column if not exists gbp_location_id text not null default '',
  add column if not exists gbp_place_id text not null default '',
  add column if not exists gbp_review_link text not null default '',
  add column if not exists manager_id uuid references public.team_members (id) on delete set null,
  add column if not exists services text[] not null default '{}',
  add column if not exists local_faq jsonb not null default '[]'::jsonb;

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  slug_locked boolean not null default false,
  page_type text not null,
  status text not null default 'draft',
  title text not null default '',
  body_markdown text not null default '',
  meta_title text not null default '',
  meta_description text not null default '',
  canonical_url text not null default '',
  answer_summary text not null default '',
  faq_items jsonb not null default '[]'::jsonb,
  json_ld jsonb not null default '{}'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  author_id uuid references public.team_members (id) on delete set null,
  reviewed_by_id uuid references public.team_members (id) on delete set null,
  reviewed_at timestamptz,
  review_notes text not null default '',
  generation_meta jsonb not null default '{"source":"human"}'::jsonb,
  last_content_update_at timestamptz not null default now(),
  priority_score integer not null default 0,
  internal_links jsonb not null default '[]'::jsonb,
  source_table text,
  source_id text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_pages_page_type_check check (
    page_type in ('clinic', 'product', 'test', 'condition', 'guide', 'comparison', 'blog', 'landing')
  ),
  constraint content_pages_status_check check (
    status in ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')
  ),
  constraint content_pages_meta_title_len check (char_length(meta_title) <= 60),
  constraint content_pages_meta_description_len check (char_length(meta_description) <= 160),
  constraint content_pages_source_table_check check (
    source_table is null or source_table in ('blog_posts', 'products', 'clinical_services', 'clinics')
  )
);

create index if not exists content_pages_status_priority_idx
  on public.content_pages (status, priority_score desc, created_at desc);

create table if not exists public.content_tickets (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  status text not null default 'open',
  priority_score integer not null default 0,
  reason text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  target_page_id uuid references public.content_pages (id) on delete set null,
  target_clinic_id uuid references public.clinics (id) on delete set null,
  suggested_slug text not null default '',
  suggested_page_type text not null default '',
  target_keywords text[] not null default '{}',
  assigned_reviewer_id uuid references public.team_members (id) on delete set null,
  generated_page_id uuid references public.content_pages (id) on delete set null,
  brief_system_prompt text not null default '',
  brief_user_prompt text not null default '',
  pasted_response jsonb,
  attempts integer not null default 0,
  last_error text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint content_tickets_type_check check (
    type in (
      'new_page', 'refresh', 'add_faq', 'fix_schema', 'meta_rewrite',
      'review_reply', 'gbp_post', 'technical_issue'
    )
  ),
  constraint content_tickets_status_check check (
    status in (
      'open', 'generating', 'brief_ready', 'draft_ready', 'in_review',
      'changes_requested', 'approved', 'published', 'dismissed', 'failed'
    )
  )
);

create index if not exists content_tickets_status_priority_idx
  on public.content_tickets (status, priority_score desc, created_at desc);

create table if not exists public.signals_search_console (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  page_url text not null,
  query text not null,
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric not null default 0,
  position numeric not null default 0,
  country text not null default '',
  device text not null default '',
  unique (date, page_url, query, country, device)
);

create table if not exists public.signals_gbp_reviews (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  gbp_review_id text not null unique,
  rating integer not null,
  text text not null default '',
  author_name text not null default '',
  created_at timestamptz not null default now(),
  reply_text text not null default '',
  reply_status text not null default 'none',
  replied_at timestamptz,
  constraint signals_gbp_reviews_reply_status_check check (
    reply_status in ('none', 'draft', 'auto_published', 'published')
  )
);

create table if not exists public.signals_gbp_insights (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  date date not null,
  calls integer not null default 0,
  direction_requests integer not null default 0,
  website_clicks integer not null default 0,
  views_search integer not null default 0,
  views_maps integer not null default 0,
  unique (clinic_id, date)
);

create table if not exists public.signals_web_vitals (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  url text not null,
  strategy text not null,
  lcp numeric,
  inp numeric,
  cls numeric,
  performance_score numeric,
  raw_json jsonb not null default '{}'::jsonb,
  unique (date, url, strategy),
  constraint signals_web_vitals_strategy_check check (strategy in ('mobile', 'desktop'))
);

create table if not exists public.signals_ai_visibility (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  engine text not null,
  source text not null,
  question text not null,
  response_text text,
  cited_domains text[] not null default '{}',
  our_domain_cited boolean not null default false,
  our_urls_cited text[] not null default '{}',
  competitor_domains_cited text[] not null default '{}',
  recorded_by_id uuid references public.team_members (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint signals_ai_visibility_engine_check check (
    engine in ('gemini', 'chatgpt', 'perplexity', 'google_ai_mode', 'claude')
  ),
  constraint signals_ai_visibility_source_check check (source in ('auto', 'manual'))
);

create table if not exists public.signals_competitors (
  id uuid primary key default gen_random_uuid(),
  competitor_domain text not null,
  url text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  title text not null default '',
  unique (competitor_domain, url)
);

create table if not exists public.signals_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  normalized_question text not null unique,
  source text not null,
  volume_hint integer not null default 0,
  seen_count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  clinic_id uuid references public.clinics (id) on delete set null,
  note text not null default '',
  constraint signals_questions_source_check check (source in ('gsc', 'reddit', 'staff'))
);

create table if not exists public.ai_probe_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null unique,
  category text not null,
  is_active boolean not null default true,
  constraint ai_probe_questions_category_check check (
    category in ('test', 'product', 'condition', 'clinic', 'pricing')
  )
);

create table if not exists public.review_edits (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.content_pages (id) on delete cascade,
  ticket_id uuid references public.content_tickets (id) on delete set null,
  reviewer_id uuid references public.team_members (id) on delete set null,
  field text not null,
  ai_version text not null default '',
  human_version text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  items_processed integer not null default 0,
  llm_requests_used integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  notes text not null default ''
);

create table if not exists public.llm_usage (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  provider text not null,
  model text not null default '',
  requests integer not null default 0,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  errors_429 integer not null default 0,
  unique (date, provider, model)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.team_members (id) on delete set null,
  channel text not null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  status text not null default 'pending',
  error text not null default '',
  created_at timestamptz not null default now(),
  constraint notifications_channel_check check (channel in ('email', 'telegram', 'in_app'))
);

create index if not exists notifications_recipient_idx
  on public.notifications (recipient_id, created_at desc);

insert into public.ai_probe_questions (question, category)
values
  ('What is the best hearing aid for an elderly person in India?', 'product'),
  ('How much do hearing aids cost in India?', 'pricing'),
  ('What is a pure tone audiometry test and how long does it take?', 'test'),
  ('What is a BERA test and who needs it?', 'test'),
  ('What is the difference between OAE and BERA tests?', 'test'),
  ('What is tympanometry used for?', 'test'),
  ('Which is better, BTE or RIC hearing aids?', 'product'),
  ('Are rechargeable hearing aids worth it?', 'product'),
  ('Can hearing aids help with tinnitus?', 'condition'),
  ('How do I know if I need a hearing test?', 'test'),
  ('What happens during a hearing test?', 'test'),
  ('Where can I get a hearing test near me?', 'clinic'),
  ('Which hearing aid brands are available in India?', 'product'),
  ('How long do hearing aids last?', 'product'),
  ('Do hearing aids work for severe hearing loss?', 'condition'),
  ('What is the difference between a hearing aid and a cochlear implant?', 'condition'),
  ('Is sudden hearing loss an emergency?', 'condition'),
  ('Can children get hearing aids?', 'product'),
  ('How often should I get my hearing tested after 60?', 'test'),
  ('What is a hearing aid trial and is it free?', 'pricing')
on conflict (question) do nothing;

create or replace function public.guard_content_page_review()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if old.slug_locked and new.slug is distinct from old.slug then
      raise exception 'slug is immutable after publish';
    end if;
    if new.body_markdown is distinct from old.body_markdown
      or new.title is distinct from old.title
      or new.answer_summary is distinct from old.answer_summary
      or new.faq_items is distinct from old.faq_items then
      new.last_content_update_at := now();
    end if;
  end if;
  if new.status = 'published' then
    new.slug_locked := true;
    if new.published_at is null then
      new.published_at := now();
    end if;
  end if;
  if new.reviewed_at is not null and new.status not in ('approved', 'published') then
    raise exception 'reviewed_at can only be set by the approve action';
  end if;
  if new.reviewed_by_id is not null and new.status not in ('approved', 'published', 'archived') then
    raise exception 'reviewed_by_id can only be set by the approve action';
  end if;
  return new;
end;
$$;

drop trigger if exists content_pages_guard_review on public.content_pages;
create trigger content_pages_guard_review
  before update on public.content_pages
  for each row execute function public.guard_content_page_review();

drop trigger if exists content_pages_guard_review_insert on public.content_pages;
create trigger content_pages_guard_review_insert
  before insert on public.content_pages
  for each row execute function public.guard_content_page_review();

drop trigger if exists content_pages_set_updated_at on public.content_pages;
create trigger content_pages_set_updated_at
  before update on public.content_pages
  for each row execute function public.set_updated_at();

drop trigger if exists content_tickets_set_updated_at on public.content_tickets;
create trigger content_tickets_set_updated_at
  before update on public.content_tickets
  for each row execute function public.set_updated_at();

alter table public.content_pages enable row level security;
alter table public.content_tickets enable row level security;
alter table public.signals_search_console enable row level security;
alter table public.signals_gbp_reviews enable row level security;
alter table public.signals_gbp_insights enable row level security;
alter table public.signals_web_vitals enable row level security;
alter table public.signals_ai_visibility enable row level security;
alter table public.signals_competitors enable row level security;
alter table public.signals_questions enable row level security;
alter table public.ai_probe_questions enable row level security;
alter table public.review_edits enable row level security;
alter table public.job_runs enable row level security;
alter table public.llm_usage enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Public read published content pages" on public.content_pages;
create policy "Public read published content pages"
  on public.content_pages for select to anon
  using (status = 'published');

drop policy if exists "Authenticated manage content pages" on public.content_pages;
create policy "Authenticated manage content pages"
  on public.content_pages for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage content tickets" on public.content_tickets;
create policy "Authenticated manage content tickets"
  on public.content_tickets for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage search console signals" on public.signals_search_console;
create policy "Authenticated manage search console signals"
  on public.signals_search_console for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage gbp reviews" on public.signals_gbp_reviews;
create policy "Authenticated manage gbp reviews"
  on public.signals_gbp_reviews for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage gbp insights" on public.signals_gbp_insights;
create policy "Authenticated manage gbp insights"
  on public.signals_gbp_insights for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage web vitals" on public.signals_web_vitals;
create policy "Authenticated manage web vitals"
  on public.signals_web_vitals for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage ai visibility" on public.signals_ai_visibility;
create policy "Authenticated manage ai visibility"
  on public.signals_ai_visibility for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage competitors" on public.signals_competitors;
create policy "Authenticated manage competitors"
  on public.signals_competitors for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage questions" on public.signals_questions;
create policy "Authenticated manage questions"
  on public.signals_questions for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage probe questions" on public.ai_probe_questions;
create policy "Authenticated manage probe questions"
  on public.ai_probe_questions for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage review edits" on public.review_edits;
create policy "Authenticated manage review edits"
  on public.review_edits for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage job runs" on public.job_runs;
create policy "Authenticated manage job runs"
  on public.job_runs for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage llm usage" on public.llm_usage;
create policy "Authenticated manage llm usage"
  on public.llm_usage for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated manage notifications" on public.notifications;
create policy "Authenticated manage notifications"
  on public.notifications for all to authenticated
  using (true) with check (true);

-- Staff can submit a patient question without a full admin session by using
-- the anon key only through a security-definer function. The admin form uses
-- the authenticated client directly.
create or replace function public.submit_staff_question(
  p_question text,
  p_clinic_id uuid,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  normalized text;
begin
  normalized := lower(trim(p_question));
  normalized := regexp_replace(normalized, '[^a-z0-9]+', ' ', 'g');
  normalized := trim(regexp_replace(normalized, '\s+', ' ', 'g'));
  if char_length(normalized) < 8 then
    raise exception 'Question is too short';
  end if;

  insert into public.signals_questions (
    question, normalized_question, source, clinic_id, note, seen_count
  )
  values (
    trim(p_question), normalized, 'staff', p_clinic_id, coalesce(p_note, ''), 1
  )
  on conflict (normalized_question) do update
  set
    seen_count = public.signals_questions.seen_count + 1,
    last_seen_at = now(),
    note = case
      when excluded.note = '' then public.signals_questions.note
      else excluded.note
    end
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.submit_staff_question(text, uuid, text) from public;
grant execute on function public.submit_staff_question(text, uuid, text) to anon, authenticated;
