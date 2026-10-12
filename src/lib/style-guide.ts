import { createClient } from "@/lib/supabase/server";

// Brukes til innholdsbyggeren er fylt ut med dine egne prinsipper (eller hvis
// databasetabellen ikke finnes ennå). Rediger dem under Innholdsbygger → Prinsipper.
export const DEFAULT_PRINCIPLES = `Struktur
- Alltid problemet eller situasjonen først, deretter løsningen.
- Artikkelen bør være en fortelling.
- Avslutt alltid artikkelen med «Hva tenker du?»

Lengde
- Aldri mer enn 4500 tegn inkludert mellomrom. Helst mindre.

Form
- Bruk korte avsnitt, mellomtitler og punktlister.
- Bruk emojis i teksten, fordi det er gøyere å lese.
- Alltid et illustrasjonsbilde til artikkelen. Bilder bryter opp teksten.

Tone og språk
- Norsk bokmål. Litt leken og morsom, men fortsatt profesjonell.
- Skriv fra min erfaring som produktleder, teamleder og konsulent.

Innhold
- Bygg kun på det jeg har skrevet inn som problem og løsning.
- Ikke finn på fakta, tall, statistikk, sitater eller konkrete kundecaser.`;

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
