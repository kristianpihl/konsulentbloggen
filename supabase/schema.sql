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
  scroll_depth integer,
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

-- Redigerbare statiske sider (f.eks. "Om meg"), administrert fra /admin/sider.
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null,
  cover_image_url text,
  nav_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pages_nav_order_idx on pages (nav_order, created_at);

alter table pages enable row level security;

drop policy if exists "Sider er offentlig lesbare" on pages;
create policy "Sider er offentlig lesbare"
  on pages
  for select
  using (true);

drop policy if exists "Admin har full tilgang til sider" on pages;
create policy "Admin har full tilgang til sider"
  on pages
  for all
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com')
  with check (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');

insert into pages (slug, title, content)
values (
  'om',
  'Om meg',
  $md$Jeg er konsulent med erfaring fra prosjekter i skjæringspunktet mellom teknologi, organisasjon og mennesker. Her på bloggen deler jeg korte, praktiske poster om ting jeg lærer underveis.

## Kompetanseområder

- Prosjekt- og leveranseledelse
- Digitalisering og prosessforbedring
- Kravarbeid og interessentstyring
- Teknologi- og løsningsforståelse

## Ta kontakt

Ønsker du å ta en prat om et prosjekt eller et oppdrag? Send meg en e-post på [kristianpihl01@gmail.com](mailto:kristianpihl01@gmail.com) eller finn meg på [LinkedIn](https://www.linkedin.com/in/kristianpihlgravdal/).
$md$
)
on conflict (slug) do nothing;

-- Delingssporing (X/LinkedIn/e-post/kopier lenke) for delingsrate i statistikken.
create table if not exists post_shares (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  method text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_shares_path_idx on post_shares (path);
create index if not exists post_shares_created_at_idx on post_shares (created_at desc);

alter table post_shares enable row level security;

drop policy if exists "Admin kan lese delingsstatistikk" on post_shares;
create policy "Admin kan lese delingsstatistikk"
  on post_shares
  for select
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');
