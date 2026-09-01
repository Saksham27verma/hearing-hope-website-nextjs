-- Full website CMS: settings, pages, and marketing collections.

alter table public.brands
  add column if not exists tagline text not null default '',
  add column if not exists country text not null default '',
  add column if not exists founded text not null default '',
  add column if not exists headquarters text not null default '',
  add column if not exists parent text not null default '',
  add column if not exists intro text not null default '',
  add column if not exists story jsonb not null default '[]'::jsonb,
  add column if not exists technologies jsonb not null default '[]'::jsonb,
  add column if not exists highlights jsonb not null default '[]'::jsonb;

create table if not exists public.site_settings (
  id text primary key default 'default',
  name text not null,
  tagline text not null default '',
  description text not null default '',
  url text not null default '',
  phone_display text not null default '',
  phone_tel text not null default '',
  whatsapp_number text not null default '',
  email text not null default '',
  extra_phones jsonb not null default '[]'::jsonb,
  address jsonb not null default '{}'::jsonb,
  rating_value text not null default '',
  review_count text not null default '',
  google_rating text not null default '',
  google_review_count text not null default '',
  google_reviews_url text not null default '',
  parent_company text not null default '',
  social jsonb not null default '{}'::jsonb,
  promo jsonb not null default '{}'::jsonb,
  footer jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_pages (
  id text primary key,
  meta_title text not null default '',
  meta_description text not null default '',
  fields jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null default '',
  certification text not null default '',
  address text not null default '',
  phone_display text not null default '',
  phone_tel text not null default '',
  hours text not null default '',
  lat double precision not null default 0,
  lng double precision not null default 0,
  blurb text not null default '',
  coming_soon boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clinical_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  short_name text not null default '',
  title text not null,
  category text not null default '',
  duration text not null default '',
  excerpt text not null default '',
  image text not null default '',
  detail_image text not null default '',
  icon text not null default 'activity',
  accent text not null default '',
  who text not null default '',
  what text not null default '',
  expect jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  honorific text not null default '',
  name text not null,
  role text not null default '',
  credentials text not null default '',
  bio text not null default '',
  image text not null default '',
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text not null default '',
  storage_path text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null default '',
  page text not null default 'all',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default '',
  quote text not null default '',
  product text not null default '',
  photo text not null default '',
  photo_alt text not null default '',
  layout text not null default 'simple',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text not null default '',
  label text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hospital_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null default '',
  logo text not null default '',
  url text not null default '',
  focus text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.style_pages (
  id public.hearing_aid_style primary key,
  name text not null default '',
  short_name text not null default '',
  description text not null default '',
  headline text not null default '',
  tagline text not null default '',
  intro text not null default '',
  facts jsonb not null default '[]'::jsonb,
  points jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  image text not null default '',
  wash text not null default ''
);

create table if not exists public.feature_pages (
  id public.hearing_aid_feature primary key,
  label text not null default '',
  nav_label text not null default '',
  tagline text not null default '',
  body text not null default '',
  who text not null default '',
  icon text not null default 'battery',
  wash text not null default '',
  headline text not null default '',
  facts jsonb not null default '[]'::jsonb,
  points jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  hero_image text not null default ''
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create trigger site_pages_set_updated_at
  before update on public.site_pages
  for each row execute function public.set_updated_at();

create trigger clinics_set_updated_at
  before update on public.clinics
  for each row execute function public.set_updated_at();

create trigger clinical_services_set_updated_at
  before update on public.clinical_services
  for each row execute function public.set_updated_at();

create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

create trigger hero_slides_set_updated_at
  before update on public.hero_slides
  for each row execute function public.set_updated_at();

create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

create trigger awards_set_updated_at
  before update on public.awards
  for each row execute function public.set_updated_at();

create trigger hospital_partners_set_updated_at
  before update on public.hospital_partners
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.site_pages enable row level security;
alter table public.clinics enable row level security;
alter table public.clinical_services enable row level security;
alter table public.team_members enable row level security;
alter table public.hero_slides enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;
alter table public.awards enable row level security;
alter table public.hospital_partners enable row level security;
alter table public.style_pages enable row level security;
alter table public.feature_pages enable row level security;

create policy "Public read site settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Authenticated manage site settings" on public.site_settings for all to authenticated using (true) with check (true);

create policy "Public read site pages" on public.site_pages for select to anon, authenticated using (true);
create policy "Authenticated manage site pages" on public.site_pages for all to authenticated using (true) with check (true);

create policy "Public read clinics" on public.clinics for select to anon, authenticated using (published);
create policy "Authenticated manage clinics" on public.clinics for all to authenticated using (true) with check (true);

create policy "Public read clinical services" on public.clinical_services for select to anon, authenticated using (published);
create policy "Authenticated manage clinical services" on public.clinical_services for all to authenticated using (true) with check (true);

create policy "Public read team members" on public.team_members for select to anon, authenticated using (published);
create policy "Authenticated manage team members" on public.team_members for all to authenticated using (true) with check (true);

create policy "Public read hero slides" on public.hero_slides for select to anon, authenticated using (published);
create policy "Authenticated manage hero slides" on public.hero_slides for all to authenticated using (true) with check (true);

create policy "Public read faqs" on public.faqs for select to anon, authenticated using (published);
create policy "Authenticated manage faqs" on public.faqs for all to authenticated using (true) with check (true);

create policy "Public read testimonials" on public.testimonials for select to anon, authenticated using (published);
create policy "Authenticated manage testimonials" on public.testimonials for all to authenticated using (true) with check (true);

create policy "Public read awards" on public.awards for select to anon, authenticated using (published);
create policy "Authenticated manage awards" on public.awards for all to authenticated using (true) with check (true);

create policy "Public read hospital partners" on public.hospital_partners for select to anon, authenticated using (published);
create policy "Authenticated manage hospital partners" on public.hospital_partners for all to authenticated using (true) with check (true);

create policy "Public read style pages" on public.style_pages for select to anon, authenticated using (true);
create policy "Authenticated manage style pages" on public.style_pages for all to authenticated using (true) with check (true);

create policy "Public read feature pages" on public.feature_pages for select to anon, authenticated using (true);
create policy "Authenticated manage feature pages" on public.feature_pages for all to authenticated using (true) with check (true);

grant select on public.site_settings, public.site_pages, public.clinics, public.clinical_services,
  public.team_members, public.hero_slides, public.faqs, public.testimonials, public.awards,
  public.hospital_partners, public.style_pages, public.feature_pages
  to anon, authenticated;

grant insert, update, delete on public.site_settings, public.site_pages, public.clinics, public.clinical_services,
  public.team_members, public.hero_slides, public.faqs, public.testimonials, public.awards,
  public.hospital_partners, public.style_pages, public.feature_pages
  to authenticated;
