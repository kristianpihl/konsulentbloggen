-- Kjør denne i Supabase → SQL Editor for å legge til sporing av
-- delinger og scroll-dybde, som gir grunnlag for fullføringsgrad og
-- delingsrate i statistikken. Trygg å kjøre flere ganger.

alter table page_views add column if not exists scroll_depth integer;

create table if not exists post_shares (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  method text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_shares_path_idx on post_shares (path);
create index if not exists post_shares_created_at_idx on post_shares (created_at desc);

alter table post_shares enable row level security;

-- Ingen policy for "anon" med vilje — skriving skjer kun via
-- server-ruten /api/track med service_role-nøkkelen.
drop policy if exists "Admin kan lese delingsstatistikk" on post_shares;
create policy "Admin kan lese delingsstatistikk"
  on post_shares
  for select
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');
