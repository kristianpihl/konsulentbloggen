-- Kjør denne i Supabase → SQL Editor etter 011 og 012.
-- 1) Maler og verktøy får en kategori (en av bloggens kategorier) i stedet
--    for typen «mal» / «verktøy».
-- 2) Et innlegg kan lenkes til en mal eller et verktøy.
-- Trygg å kjøre flere ganger (idempotent).

alter table resources add column if not exists category text;
alter table resources drop column if exists kind;

alter table posts
  add column if not exists resource_id uuid references resources(id) on delete set null;

create index if not exists posts_resource_id_idx on posts (resource_id);
