-- Kjør denne i Supabase → SQL Editor for prosjektet ditt.
-- Oppretter tabellen for blogginnlegg og sikkerhetsregler (RLS).

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  cover_image_url text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on posts (status, published_at desc);

alter table posts enable row level security;

-- Alle (også ikke-innloggede besøkende) kan lese publiserte innlegg.
drop policy if exists "Publiserte innlegg er offentlig lesbare" on posts;
create policy "Publiserte innlegg er offentlig lesbare"
  on posts
  for select
  using (status = 'published');

-- Kun den innloggede admin-brukeren (identifisert på e-post) kan
-- lese utkast og opprette/endre/slette innlegg.
-- Bytt ut e-postadressen under med din egen admin-e-post hvis den er en annen.
drop policy if exists "Admin har full tilgang" on posts;
create policy "Admin har full tilgang"
  on posts
  for all
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com')
  with check (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');

-- Lagringsboks for forsidebilder på innlegg.
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "Artikkelbilder er offentlig lesbare" on storage.objects;
create policy "Artikkelbilder er offentlig lesbare"
  on storage.objects
  for select
  using (bucket_id = 'post-images');

drop policy if exists "Admin kan laste opp artikkelbilder" on storage.objects;
create policy "Admin kan laste opp artikkelbilder"
  on storage.objects
  for insert
  with check (
    bucket_id = 'post-images'
    and auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com'
  );

drop policy if exists "Admin kan oppdatere artikkelbilder" on storage.objects;
create policy "Admin kan oppdatere artikkelbilder"
  on storage.objects
  for update
  using (
    bucket_id = 'post-images'
    and auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com'
  );

drop policy if exists "Admin kan slette artikkelbilder" on storage.objects;
create policy "Admin kan slette artikkelbilder"
  on storage.objects
  for delete
  using (
    bucket_id = 'post-images'
    and auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com'
  );

-- Besøksstatistikk (sidevisninger og tid brukt per side).
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  session_id text not null,
  referrer text,
  duration_seconds numeric,
  created_at timestamptz not null default now()
);

create index if not exists page_views_path_idx on page_views (path);
create index if not exists page_views_created_at_idx on page_views (created_at desc);

alter table page_views enable row level security;

-- Ingen policy for "anon" med vilje — skriving skjer kun via
-- server-ruten /api/track med service_role-nøkkelen.
drop policy if exists "Admin kan lese besøksstatistikk" on page_views;
create policy "Admin kan lese besøksstatistikk"
  on page_views
  for select
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');

-- Redigerbart hovedbilde på forsiden.
create table if not exists site_settings (
  id text primary key default 'default',
  hero_image_url text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values ('default')
on conflict (id) do nothing;

alter table site_settings enable row level security;

drop policy if exists "Alle kan lese sideinnstillinger" on site_settings;
create policy "Alle kan lese sideinnstillinger"
  on site_settings
  for select
  using (true);

drop policy if exists "Admin kan oppdatere sideinnstillinger" on site_settings;
create policy "Admin kan oppdatere sideinnstillinger"
  on site_settings
  for update
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com')
  with check (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');
