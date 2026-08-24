-- Hearing aid catalog: brands, models, features, colours, images.

create extension if not exists "pgcrypto";

create type hearing_aid_style as enum ('RIC', 'BTE', 'ITC', 'CIC', 'IIC', 'ITE');

create type hearing_aid_feature as enum (
  'rechargeable',
  'bluetooth',
  'noise-cancellation',
  'invisible',
  'custom-fit',
  'power'
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  logo_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  brand_id uuid not null references public.brands (id) on delete restrict,
  style hearing_aid_style not null,
  name text not null,
  badge text not null default '',
  tagline text not null default '',
  overview text not null default '',
  mrp numeric(12, 2) not null,
  in_stock boolean not null default true,
  published boolean not null default true,
  rating numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_brand_id_idx on public.products (brand_id);
create index products_style_idx on public.products (style);
create index products_published_idx on public.products (published);

create table public.product_features (
  product_id uuid not null references public.products (id) on delete cascade,
  feature_id hearing_aid_feature not null,
  primary key (product_id, feature_id)
);

create table public.product_highlights (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  title text not null,
  body text not null default '',
  sort_order integer not null default 0
);

create index product_highlights_product_id_idx on public.product_highlights (product_id);

create table public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  hex text,
  is_default boolean not null default false,
  in_stock boolean not null default true,
  sort_order integer not null default 0
);

create index product_colors_product_id_idx on public.product_colors (product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  color_id uuid references public.product_colors (id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0
);

create index product_images_product_id_idx on public.product_images (product_id);
create index product_images_color_id_idx on public.product_images (color_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger brands_set_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_features enable row level security;
alter table public.product_highlights enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_images enable row level security;

create policy "Public read brands"
  on public.brands for select
  to anon, authenticated
  using (true);

create policy "Authenticated manage brands"
  on public.brands for all
  to authenticated
  using (true)
  with check (true);

create policy "Public read published products"
  on public.products for select
  to anon
  using (published = true);

create policy "Authenticated read products"
  on public.products for select
  to authenticated
  using (true);

create policy "Authenticated manage products"
  on public.products for insert
  to authenticated
  with check (true);

create policy "Authenticated update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated delete products"
  on public.products for delete
  to authenticated
  using (true);

create policy "Public read published product features"
  on public.product_features for select
  to anon
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.published = true
    )
  );

create policy "Authenticated read product features"
  on public.product_features for select
  to authenticated
  using (true);

create policy "Authenticated manage product features"
  on public.product_features for all
  to authenticated
  using (true)
  with check (true);

create policy "Public read published product highlights"
  on public.product_highlights for select
  to anon
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.published = true
    )
  );

create policy "Authenticated read product highlights"
  on public.product_highlights for select
  to authenticated
  using (true);

create policy "Authenticated manage product highlights"
  on public.product_highlights for all
  to authenticated
  using (true)
  with check (true);

create policy "Public read published product colors"
  on public.product_colors for select
  to anon
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.published = true
    )
  );

create policy "Authenticated read product colors"
  on public.product_colors for select
  to authenticated
  using (true);

create policy "Authenticated manage product colors"
  on public.product_colors for all
  to authenticated
  using (true)
  with check (true);

create policy "Public read published product images"
  on public.product_images for select
  to anon
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.published = true
    )
  );

create policy "Authenticated read product images"
  on public.product_images for select
  to authenticated
  using (true);

create policy "Authenticated manage product images"
  on public.product_images for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Authenticated upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Authenticated update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

create policy "Authenticated delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

insert into public.brands (id, slug, name, logo_url, sort_order) values
  ('11111111-1111-4111-8111-111111111001', 'signia', 'Signia', '/images/brands/signia.svg', 1),
  ('11111111-1111-4111-8111-111111111002', 'phonak', 'Phonak', '/images/brands/phonak.svg', 2),
  ('11111111-1111-4111-8111-111111111003', 'widex', 'Widex', '/images/brands/widex.svg', 3),
  ('11111111-1111-4111-8111-111111111004', 'oticon', 'Oticon', '/images/brands/oticon.svg', 4),
  ('11111111-1111-4111-8111-111111111005', 'starkey', 'Starkey', '/images/brands/starkey.svg', 5),
  ('11111111-1111-4111-8111-111111111006', 'resound', 'ReSound', '/images/brands/resound.svg', 6);
