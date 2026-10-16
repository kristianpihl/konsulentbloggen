import { createClient } from "@/lib/supabase/server";

// Brukes til innholdsbyggeren er fylt ut med dine egne prinsipper (eller hvis
// databasetabellen ikke finnes ennå). Rediger dem under Innholdsbygger → Prinsipper.
export const DEFAULT_PRINCIPLES = `Struktur
- Alltid tittel, ingress (2–3 setninger, i fet skrift) og brødtekst.
- Alltid problemet eller situasjonen først, deretter løsningen.
- Artikkelen er en fortelling i jeg-form fra min erfaring, med ærlig usikkerhet.
- Avslutt alltid med overskriften «## Hva tenker du? 💬» som siste linje, én gang og uten noe etter.

Lengde
- Aldri mer enn 4500 tegn inkludert mellomrom. Helst mindre (sikt mot 2500–3500).

Form
- Bruk korte avsnitt, mellomtitler og punktlister.
- Bruk emojis i teksten, fordi det er gøyere å lese.
- Alltid en illustrasjon til artikkelen. Jeg beskriver hva den skal inneholde.

Tone og språk
- Norsk bokmål. Litt leken og morsom, men fortsatt profesjonell.

Stilgrep å prøve (valgfrie, bruk der det passer)
- Åpne i en scene. Kontrast mellom to veier. Vendepunkt på egen linje.
- Én bærende hverdagsmetafor. Et fengende navn på ideen.

Innhold
- Bygg kun på det jeg har skrevet inn som problem og løsning.
- Ikke finn på fakta, tall, statistikk, sitater, konkrete kundecaser eller detaljer (navn, ukedager, replikker).`;

export async function getStyleGuide(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("style_guide")
    .select("principles")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    console.error("Klarte ikke å hente prinsipper (kjør migrasjon 010?):", error.message);
    return DEFAULT_PRINCIPLES;
  }

  return data?.principles?.trim() ? data.principles : DEFAULT_PRINCIPLES;
}
