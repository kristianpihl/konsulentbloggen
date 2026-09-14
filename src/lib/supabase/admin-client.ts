import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ Bruker service_role-nøkkelen, som omgår RLS helt (full tilgang til
// databasen). Må ALDRI importeres i en Client Component eller eksponeres
// til nettleseren — kun brukt server-side i Route Handlers/Server Actions
// som selv står for tilgangskontrollen (f.eks. /api/track, som bevisst
// tar imot anonyme besøksdata).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
