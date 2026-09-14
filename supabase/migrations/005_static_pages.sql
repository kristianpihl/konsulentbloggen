-- Kjør denne i Supabase → SQL Editor for å legge til støtte for
-- redigerbare statiske sider (f.eks. "Om meg"), administrert fra
-- /admin/sider. Trygg å kjøre flere ganger (idempotent).

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null,
  nav_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pages_nav_order_idx on pages (nav_order, created_at);

alter table pages enable row level security;

-- Alle kan lese sider — de skal jo vises offentlig i toppmenyen.
drop policy if exists "Sider er offentlig lesbare" on pages;
create policy "Sider er offentlig lesbare"
  on pages
  for select
  using (true);

-- Kun admin kan opprette, endre eller slette sider.
drop policy if exists "Admin har full tilgang til sider" on pages;
create policy "Admin har full tilgang til sider"
  on pages
  for all
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com')
  with check (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');

-- Flytter innholdet fra den tidligere hardkodede "Om meg"-siden inn i
-- det nye systemet, slik at den nå kan redigeres fra /admin/sider.
-- Rører ikke noe hvis en side med slug "om" allerede finnes.
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
