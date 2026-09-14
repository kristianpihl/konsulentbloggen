import { createClient } from "@/lib/supabase/server";

export interface SiteSettings {
  hero_image_url: string | null;
}

// Henter forsidens redigerbare innstillinger (foreløpig kun hovedbildet).
// Lesbar for alle (også anonyme besøkende), siden den vises offentlig.
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("hero_image_url")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    console.error("Klarte ikke å hente sideinnstillinger:", error.message);
    return { hero_image_url: null };
  }

  return { hero_image_url: data?.hero_image_url ?? null };
}
