-- Clinic gallery and branch photos managed from the CMS.

create table public.site_media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('gallery', 'clinic')),
  slot text not null,
  sort_order integer not null default 0,
  url text not null,
  alt text not null default '',
  storage_path text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index site_media_gallery_slot_uidx
  on public.site_media (slot)
  where kind = 'gallery';

create index site_media_kind_slot_idx
  on public.site_media (kind, slot, sort_order);

create trigger site_media_set_updated_at
  before update on public.site_media
  for each row execute function public.set_updated_at();

alter table public.site_media enable row level security;

create policy "Public read site media"
  on public.site_media for select
  to anon, authenticated
  using (true);

create policy "Authenticated manage site media"
  on public.site_media for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "Public read site images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-images');

create policy "Authenticated upload site images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images');

create policy "Authenticated update site images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images')
  with check (bucket_id = 'site-images');

create policy "Authenticated delete site images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images');
