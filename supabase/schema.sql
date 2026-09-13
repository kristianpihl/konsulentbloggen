-- Kjør denne i Supabase → SQL Editor for prosjektet ditt.
-- Oppretter tabellen for blogginnlegg og sikkerhetsregler (RLS).

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
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
create policy "Publiserte innlegg er offentlig lesbare"
  on posts
  for select
  using (status = 'published');

-- Kun den innloggede admin-brukeren (identifisert på e-post) kan
-- lese utkast og opprette/endre/slette innlegg.
-- Bytt ut e-postadressen under med din egen admin-e-post hvis den er en annen.
create policy "Admin har full tilgang"
  on posts
  for all
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com')
  with check (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');
