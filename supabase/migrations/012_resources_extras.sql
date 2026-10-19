-- Kjør denne i Supabase → SQL Editor etter 011_resources.sql.
-- Legger til «Passer best for» og «Nøkkelfunksjoner» på maler og verktøy.
-- Trygg å kjøre flere ganger (idempotent).

alter table resources add column if not exists best_for text[] not null default '{}';
alter table resources add column if not exists key_features text[] not null default '{}';
