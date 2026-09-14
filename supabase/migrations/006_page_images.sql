-- Kjør denne i Supabase → SQL Editor for å legge til støtte for
-- forsidebilder på statiske sider. Trygg å kjøre flere ganger.

alter table pages add column if not exists cover_image_url text;
