-- Kjør denne i Supabase → SQL Editor for å legge til besøksstatistikk.
-- Trygg å kjøre flere ganger (idempotent).

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

-- Merk: det finnes bevisst INGEN policy som gir "anon"-rollen tilgang.
-- All skriving skjer via server-ruten /api/track som bruker
-- service_role-nøkkelen (omgår RLS helt) — besøkende kan altså ikke
-- lese eller skrive til denne tabellen direkte via nettleseren.

drop policy if exists "Admin kan lese besøksstatistikk" on page_views;
create policy "Admin kan lese besøksstatistikk"
  on page_views
  for select
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');
