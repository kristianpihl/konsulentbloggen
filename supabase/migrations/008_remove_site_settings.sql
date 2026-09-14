-- Kjør denne i Supabase → SQL Editor for å fjerne det gamle,
-- nå ubrukte "fast hovedbilde"-systemet (erstattet av at forsiden
-- viser siste innlegg sitt eget bilde i stedet). Trygg å kjøre flere
-- ganger.

drop table if exists site_settings;
