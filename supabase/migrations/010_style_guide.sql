-- Kjør denne i Supabase → SQL Editor for å lagre prinsippene (stilguiden)
-- som innholdsbyggeren skriver artikler etter. Kun admin har tilgang.
-- Trygg å kjøre flere ganger.

create table if not exists style_guide (
  id text primary key default 'default',
  principles text not null default '',
  updated_at timestamptz not null default now()
);

alter table style_guide enable row level security;

drop policy if exists "Admin har full tilgang til stilguide" on style_guide;
create policy "Admin har full tilgang til stilguide"
  on style_guide
  for all
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com')
  with check (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');
