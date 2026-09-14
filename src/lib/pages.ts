import { createClient } from "@/lib/supabase/server";
import type { StaticPage } from "@/types/page";

// Hent alle statiske sider i menyrekkefølge. Brukes i toppmenyen.
export async function getPagesForNav(): Promise<StaticPage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("nav_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Klarte ikke å hente sider:", error.message);
    return [];
  }

  return data ?? [];
}

// Hent én side via slug. Brukes på /[slug].
export async function getPageBySlug(slug: string): Promise<StaticPage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Klarte ikke å hente side:", error.message);
    return null;
  }

  return data;
}

// Hent alle sider for admin-dashbordet.
export async function getAllPagesForAdmin(): Promise<StaticPage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("nav_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Klarte ikke å hente sider for admin:", error.message);
    return [];
  }

  return data ?? [];
}

// Hent én side via id. Brukes i redigeringsskjemaet.
export async function getPageById(id: string): Promise<StaticPage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Klarte ikke å hente side:", error.message);
    return null;
  }

  return data;
}
