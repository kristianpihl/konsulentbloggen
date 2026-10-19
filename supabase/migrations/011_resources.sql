-- Kjør denne i Supabase → SQL Editor for å legge til «Maler og verktøy»
-- (artikler med nedlastbare filer), administrert fra /admin/maler.
-- Trygg å kjøre flere ganger (idempotent).

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  kind text not null default 'mal' check (kind in ('mal', 'verktoy')),
  cover_image_url text,
  -- Liste av vedlegg: [{ "name", "path", "url", "size", "type" }]
  files jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_published_idx
  on resources (status, published_at desc);

alter table resources enable row level security;

-- Alle kan lese publiserte maler og verktøy.
drop policy if exists "Publiserte maler er offentlig lesbare" on resources;
create policy "Publiserte maler er offentlig lesbare"
  on resources
  for select
  using (status = 'published' and published_at <= now());

-- Kun admin kan lese utkast, opprette, endre og slette.
drop policy if exists "Admin har full tilgang til maler" on resources;
create policy "Admin har full tilgang til maler"
  on resources
  for all
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com')
  with check (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');

-- Offentlig lagringsboks for vedleggene (nedlastbare filer).
insert into storage.buckets (id, name, public)
values ('resource-files', 'resource-files', true)
on conflict (id) do nothing;

drop policy if exists "Malfiler er offentlig lesbare" on storage.objects;
create policy "Malfiler er offentlig lesbare"
  on storage.objects
  for select
  using (bucket_id = 'resource-files');

drop policy if exists "Admin kan laste opp malfiler" on storage.objects;
create policy "Admin kan laste opp malfiler"
  on storage.objects
  for insert
  with check (
    bucket_id = 'resource-files'
    and auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com'
  );

drop policy if exists "Admin kan oppdatere malfiler" on storage.objects;
create policy "Admin kan oppdatere malfiler"
  on storage.objects
  for update
  using (
    bucket_id = 'resource-files'
    and auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com'
  );

drop policy if exists "Admin kan slette malfiler" on storage.objects;
create policy "Admin kan slette malfiler"
  on storage.objects
  for delete
  using (
    bucket_id = 'resource-files'
    and auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com'
  );
