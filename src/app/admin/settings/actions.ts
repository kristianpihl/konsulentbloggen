"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsFormState = { error: string; success?: boolean } | null;

export async function updateSiteSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const heroImageUrl = String(formData.get("hero_image_url") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      hero_image_url: heroImageUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { error: "", success: true };
}
