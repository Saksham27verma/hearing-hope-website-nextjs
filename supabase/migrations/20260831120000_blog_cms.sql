-- Blog CMS: articles, SEO fields, slug redirects, cover-image storage.

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  category text not null default '',
  published boolean not null default false,
  published_at date not null default current_date,
  read_time text not null default '',
  image text not null default '',
  image_alt text not null default '',
  author_name text not null default '',
  author_role text not null default '',
  author_image text not null default '',
  sections jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  meta_title text not null default '',
  meta_description text not null default '',
  focus_keyword text not null default '',
  keywords text[] not null default '{}',
  canonical_path text not null default '',
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  og_title text not null default '',
  og_description text not null default '',
  og_image text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_published_idx on public.blog_posts (published);
create index blog_posts_published_at_idx on public.blog_posts (published_at desc);
create index blog_posts_category_idx on public.blog_posts (category);

create table public.blog_redirects (
  from_slug text primary key,
  to_slug text not null,
  created_at timestamptz not null default now()
);

create index blog_redirects_to_slug_idx on public.blog_redirects (to_slug);

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;
alter table public.blog_redirects enable row level security;

create policy "Public read published blog posts"
  on public.blog_posts for select
  to anon
  using (published = true);

create policy "Authenticated read blog posts"
  on public.blog_posts for select
  to authenticated
  using (true);

create policy "Authenticated insert blog posts"
  on public.blog_posts for insert
  to authenticated
  with check (true);

create policy "Authenticated update blog posts"
  on public.blog_posts for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated delete blog posts"
  on public.blog_posts for delete
  to authenticated
  using (true);

create policy "Public read blog redirects"
  on public.blog_redirects for select
  to anon, authenticated
  using (true);

create policy "Authenticated manage blog redirects"
  on public.blog_redirects for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy "Public read blog images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-images');

create policy "Authenticated upload blog images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images');

create policy "Authenticated update blog images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images')
  with check (bucket_id = 'blog-images');

create policy "Authenticated delete blog images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images');
