import { createAdminClient } from "@/lib/supabase/admin-client";

// Tar imot anonyme besøksdata fra src/components/site-analytics.tsx og
// src/components/share-dialog.tsx, og skriver dem til Supabase med
// service_role-nøkkelen (RLS-tabellene har ingen skrivetilgang for
// vanlige besøkende).
//
// Tre hendelser:
// - "view":  ny sidevisning. Returnerer radens id slik at klienten kan
//            sende varighet/scroll-dybde tilbake når besøket avsluttes.
// - "leave": oppdaterer duration_seconds og scroll_depth på en tidligere
//            "view"-rad.
// - "share": registrerer at noen delte en artikkel (og hvordan).

const MAX_PATH_LENGTH = 512;
const MAX_DURATION_SECONDS = 60 * 60 * 6; // 6 timer, urimelig lengre enn det er reell lesetid
const VALID_SHARE_METHODS = ["copy", "twitter", "linkedin", "email", "native"];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ugyldig JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Ugyldig payload" }, { status: 400 });
  }

  const { event } = body as { event?: unknown };
  const supabase = createAdminClient();

  if (event === "view") {
    const { path, sessionId, referrer } = body as {
      path?: unknown;
      sessionId?: unknown;
      referrer?: unknown;
    };

    if (
      typeof path !== "string" ||
      !path.startsWith("/") ||
      path.length > MAX_PATH_LENGTH ||
      typeof sessionId !== "string" ||
      sessionId.length === 0 ||
      sessionId.length > 100
    ) {
      return Response.json({ error: "Ugyldig payload" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("page_views")
      .insert({
        path,
        session_id: sessionId,
        referrer:
          typeof referrer === "string" ? referrer.slice(0, 512) : null,
      })
      .select("id")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ id: data.id });
  }

  if (event === "leave") {
    const { id, durationSeconds, scrollDepth } = body as {
      id?: unknown;
      durationSeconds?: unknown;
      scrollDepth?: unknown;
    };

    if (
      typeof id !== "string" ||
      typeof durationSeconds !== "number" ||
      !Number.isFinite(durationSeconds) ||
      durationSeconds < 0 ||
      durationSeconds > MAX_DURATION_SECONDS
    ) {
      return Response.json({ error: "Ugyldig payload" }, { status: 400 });
    }

    const update: { duration_seconds: number; scroll_depth?: number } = {
      duration_seconds: durationSeconds,
    };

    if (typeof scrollDepth === "number" && Number.isFinite(scrollDepth)) {
      update.scroll_depth = Math.max(0, Math.min(100, Math.round(scrollDepth)));
    }

    const { error } = await supabase
      .from("page_views")
      .update(update)
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  }

  if (event === "share") {
    const { path, method } = body as { path?: unknown; method?: unknown };

    if (
      typeof path !== "string" ||
      !path.startsWith("/") ||
      path.length > MAX_PATH_LENGTH ||
      typeof method !== "string" ||
      !VALID_SHARE_METHODS.includes(method)
    ) {
      return Response.json({ error: "Ugyldig payload" }, { status: 400 });
    }

    const { error } = await supabase.from("post_shares").insert({ path, method });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Ukjent hendelse" }, { status: 400 });
}
