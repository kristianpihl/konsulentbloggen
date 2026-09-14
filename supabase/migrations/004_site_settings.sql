-- Kjør denne i Supabase → SQL Editor for å legge til støtte for et
-- redigerbart hovedbilde på forsiden. Trygg å kjøre flere ganger.

create table if not exists site_settings (
  id text primary key default 'default',
  hero_image_url text,
  updated_at timestamptz not null default now()
);

-- Sørger for at det alltid finnes nøyaktig én rad å lese/oppdatere.
insert into site_settings (id) values ('default')
on conflict (id) do nothing;

alter table site_settings enable row level security;

-- Alle (også besøkende) må kunne lese hovedbildet, siden det vises på
-- den offentlige forsiden.
drop policy if exists "Alle kan lese sideinnstillinger" on site_settings;
create policy "Alle kan lese sideinnstillinger"
  on site_settings
  for select
  using (true);

-- Kun admin kan endre det.
drop policy if exists "Admin kan oppdatere sideinnstillinger" on site_settings;
create policy "Admin kan oppdatere sideinnstillinger"
  on site_settings
  for update
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com')
  with check (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');
