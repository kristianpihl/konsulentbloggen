-- Kjør denne i Supabase → SQL Editor for planlagt publisering.
-- Et innlegg med status 'published' og publiseringstidspunkt frem i tid
-- er "planlagt", og skal ikke kunne leses offentlig før tiden er inne.
-- Trygg å kjøre flere ganger.

drop policy if exists "Publiserte innlegg er offentlig lesbare" on posts;
create policy "Publiserte innlegg er offentlig lesbare"
  on posts
  for select
  using (status = 'published' and published_at <= now());
