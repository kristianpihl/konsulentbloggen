import { createAdminClient } from "@/lib/supabase/admin-client";

// Tar imot anonyme besøksdata fra src/components/site-analytics.tsx og
// skriver dem til Supabase med service_role-nøkkelen (RLS-tabellen
// page_views har ingen skrivetilgang for vanlige besøkende).
//
// To hendelser:
// - "view":  ny sidevisning. Returnerer radens id slik at klienten kan
//            sende varigheten tilbake når besøket avsluttes.
// - "leave": oppdaterer duration_seconds på en tidligere "view"-rad.

const MAX_PATH_LENGTH = 512;
const MAX_DURATION_SECONDS = 60 * 60 * 6; // 6 timer, urimelig lengre enn det er reell lesetid

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
    const { id, durationSeconds } = body as {
      id?: unknown;
      durationSeconds?: unknown;
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

    const { error } = await supabase
      .from("page_views")
      .update({ duration_seconds: durationSeconds })
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Ukjent hendelse" }, { status: 400 });
}
