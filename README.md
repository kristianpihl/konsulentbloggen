# Konsulentbloggen

Personlig konsulent-blogg bygget med Next.js, Tailwind CSS og Supabase.
Innlegg skrives og publiseres via et innlogget admin-panel på `/admin`.

## Teknologi

- **Next.js (App Router)** — rammeverk, hostes på Vercel
- **Tailwind CSS** — styling
- **Supabase** — database (blogginnlegg) + autentisering (admin-innlogging)
- **react-markdown** — rendrer innleggstekst skrevet i Markdown

## Kom i gang lokalt

```bash
npm install
npm run dev
```

Siden kjører da på http://localhost:3000 (eller port satt i `.claude/launch.json`).

Du trenger et `.env.local` med Supabase-nøkler — se `.env.local.example`.

## Sette opp Supabase

1. Opprett et prosjekt på [supabase.com](https://supabase.com).
2. Gå til **SQL Editor** og kjør innholdet i [`supabase/schema.sql`](./supabase/schema.sql). Dette oppretter `posts`-tabellen og sikkerhetsreglene (RLS).
3. I schema-filen er admin-tilgangen låst til én e-postadresse (`auth.jwt() ->> 'email'`). Bytt den ut med din egen admin-e-post før du kjører scriptet, hvis den er en annen enn `kristianpihl01@gmail.com`.
4. Gå til **Authentication → Users** og opprett en bruker manuelt med samme e-postadresse og et passord. Dette er brukeren du logger inn med på `/admin/login`.
5. Gå til **Project Settings → API** og kopier:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Legg disse i `.env.local` lokalt, og som **Environment Variables** i Vercel-prosjektet (se under).

## Deploy til Vercel

1. Push repoet til GitHub (allerede satt opp).
2. Gå til [vercel.com/new](https://vercel.com/new) og importer GitHub-repoet `konsulentbloggen`.
3. Legg til de to miljøvariablene fra Supabase-steget over under **Environment Variables** (gjelder for Production, Preview og Development).
4. Deploy. Hver `git push` til `main` trigger automatisk en ny deploy.

## Koble til domenet kristianpihl.no

1. I Vercel-prosjektet: **Settings → Domains** → legg til `kristianpihl.no` (og gjerne `www.kristianpihl.no`).
2. Vercel viser hvilke DNS-oppføringer som trengs. Typisk:
   - Apex-domene (`kristianpihl.no`): A-post til `76.76.21.21`
   - `www`: CNAME til `cname.vercel-dns.com`
3. Legg inn disse hos din DNS/domeneregistrar (der du kjøpte domenet).
4. Vent på DNS-propagering (fra minutter til noen timer) — Vercel viser status som "Valid" når det er klart.

## Skrive innlegg

1. Logg inn på `/admin/login` med brukeren du opprettet i Supabase.
2. Gå til `/admin/new` for å skrive et nytt innlegg. Innhold skrives i Markdown.
3. Sett status til **Utkast** mens du jobber, og **Publisert** når det skal være synlig på `/blog`.
4. Endre eller slett eksisterende innlegg fra `/admin`.

## Tilpasse innhold og design

- `src/lib/site-config.ts` — navn, tagline, e-post, LinkedIn-lenke
- `src/app/(site)/om/page.tsx` — "Om meg"-siden og kompetanseliste
- `src/components/`, `src/app/(site)/` — layout og styling (Tailwind-klasser)
