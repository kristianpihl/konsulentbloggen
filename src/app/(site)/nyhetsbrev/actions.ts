"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin-client";

export type SubscribeState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "done" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOKEN_PATTERN = /^[0-9a-f-]{36}$/i;

// Innmelding fra /nyhetsbrev. Skriver med service_role-nøkkelen fordi
// subscribers-tabellen ikke har noen skrivetilgang for besøkende.
export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  // Skjult felt som bare roboter fyller ut: late som om det gikk bra.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "done" };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const wantsPosts = formData.get("wants_posts") === "on";
  const wantsResources = formData.get("wants_resources") === "on";

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { status: "error", message: "Skriv inn en gyldig e-postadresse." };
  }
  if (!wantsPosts && !wantsResources) {
    return { status: "error", message: "Velg minst én ting du vil få beskjed om." };
  }

  const supabase = createAdminClient();
  const { data: existing, error: lookupError } = await supabase
    .from("subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("Nyhetsbrev: oppslag feilet:", lookupError.message);
    return { status: "error", message: "Noe gikk galt. Prøv igjen litt senere." };
  }

  if (existing) {
    const rejoining = existing.status !== "active";
    const { error } = await supabase
      .from("subscribers")
      .update({
        wants_posts: wantsPosts,
        wants_resources: wantsResources,
        status: "active",
        unsubscribed_at: null,
        ...(rejoining ? { subscribed_at: new Date().toISOString() } : {}),
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Nyhetsbrev: oppdatering feilet:", error.message);
      return { status: "error", message: "Noe gikk galt. Prøv igjen litt senere." };
    }
    return { status: "done" };
  }

  const { error } = await supabase.from("subscribers").insert({
    email,
    wants_posts: wantsPosts,
    wants_resources: wantsResources,
  });

  if (error) {
    console.error("Nyhetsbrev: innmelding feilet:", error.message);
    return { status: "error", message: "Noe gikk galt. Prøv igjen litt senere." };
  }
  return { status: "done" };
}

// Avmelding via hemmelig token (fra lenken i e-postene).
export async function unsubscribe(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (!TOKEN_PATTERN.test(token)) redirect("/nyhetsbrev/avmeld?feil=1");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .select("id");

  if (error || !data || data.length === 0) redirect("/nyhetsbrev/avmeld?feil=1");
  redirect("/nyhetsbrev/avmeld?ferdig=1");
}
