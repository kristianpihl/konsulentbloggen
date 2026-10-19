-- Kjør denne i Supabase → SQL Editor for å legge til nyhetsbrev-abonnenter.
-- Trygg å kjøre flere ganger (idempotent).

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  wants_posts boolean not null default true,
  wants_resources boolean not null default true,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  -- Hemmelig token brukt i avmeldingslenken, slik at ingen kan melde av andre.
  unsubscribe_token uuid not null default gen_random_uuid(),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create unique index if not exists subscribers_email_key on subscribers (lower(email));
create unique index if not exists subscribers_token_key on subscribers (unsubscribe_token);
create index if not exists subscribers_subscribed_at_idx on subscribers (subscribed_at);

alter table subscribers enable row level security;

-- Bevisst INGEN policy for "anon": innmelding og avmelding skjer via
-- server actions som bruker service_role-nøkkelen. Besøkende kan dermed
-- ikke lese e-postlisten eller skrive direkte mot tabellen.

drop policy if exists "Admin kan lese abonnenter" on subscribers;
create policy "Admin kan lese abonnenter"
  on subscribers
  for select
  using (auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com');
