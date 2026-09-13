import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase-klient for bruk i Server Components, Server Actions og Route Handlers.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll kalles fra en Server Component uten mulighet til å sette cookies.
            // Kan ignoreres så lenge middleware.ts fornyer sesjonen.
          }
        },
      },
    },
  );
}
