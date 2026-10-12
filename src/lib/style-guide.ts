import { createClient } from "@/lib/supabase/server";

// Brukes til innholdsbyggeren er fylt ut med dine egne prinsipper (eller hvis
// databasetabellen ikke finnes ennå). Rediger dem under Innholdsbygger → Prinsipper.
export const DEFAULT_PRINCIPLES = `Struktur
- Hver artikkel starter med et konkret problem eller en gjenkjennelig situasjon.
- Deretter kommer løsningen: hva man kan gjøre, steg for steg eller som noen få tydelige grep.
- Avslutt kort, med det viktigste å ta med seg.

Tone og språk
- Norsk bokmål. Praktisk, jordnær og direkte. Uformell tone, men profesjonell.
- Korte avsnitt og gjerne underoverskrifter. Unngå fagsjargong uten forklaring.
- Skriv fra min erfaring som produktleder, teamleder og konsulent.

Innhold
- Bygg kun på det jeg har skrevet inn som problem og løsning.
- Ikke finn på fakta, tall, statistikk, sitater eller konkrete kundecaser.
- Maks 4500 tegn inkludert mellomrom.`;

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
