-- Kjør denne i Supabase → SQL Editor for å legge til støtte for
-- forsidebilder på innlegg (kun trengs én gang på et prosjekt som
-- allerede har kjørt supabase/schema.sql).
--
-- Trygg å kjøre flere ganger (idempotent) — dropper og gjenoppretter
-- policyene i stedet for å feile hvis de allerede finnes.

alter table posts add column if not exists cover_image_url text;

-- Oppretter en offentlig lagringsboks (bucket) for artikkelbilder.
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Alle kan lese/vise bilder i denne boksen (de skal jo vises på den
-- offentlige bloggen).
drop policy if exists "Artikkelbilder er offentlig lesbare" on storage.objects;
create policy "Artikkelbilder er offentlig lesbare"
  on storage.objects
  for select
  using (bucket_id = 'post-images');

-- Kun admin (samme e-post som i schema.sql) kan laste opp, erstatte
-- eller slette bilder.
drop policy if exists "Admin kan laste opp artikkelbilder" on storage.objects;
create policy "Admin kan laste opp artikkelbilder"
  on storage.objects
  for insert
  with check (
    bucket_id = 'post-images'
    and auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com'
  );

drop policy if exists "Admin kan oppdatere artikkelbilder" on storage.objects;
create policy "Admin kan oppdatere artikkelbilder"
  on storage.objects
  for update
  using (
    bucket_id = 'post-images'
    and auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com'
  );

drop policy if exists "Admin kan slette artikkelbilder" on storage.objects;
create policy "Admin kan slette artikkelbilder"
  on storage.objects
  for delete
  using (
    bucket_id = 'post-images'
    and auth.jwt() ->> 'email' = 'kristianpihl01@gmail.com'
  );
