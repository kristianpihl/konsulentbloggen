import { createClient } from "@/lib/supabase/server";
import type { Resource, ResourceKind } from "@/types/resource";

// Publiserte maler og verktøy, nyeste først. Valgfritt filter på type.
export async function getPublishedResources(
  kind?: ResourceKind,
): Promise<Resource[]> {
  const supabase = await createClient();
  let query = supabase
    .from("resources")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (kind) query = query.eq("kind", kind);

  const { data, error } = await query;

  if (error) {
    console.error("Klarte ikke å hente maler (kjør migrasjon 011?):", error.message);
    return [];
  }

  return data ?? [];
}

export async function getPublishedResourceBySlug(
  slug: string,
): Promise<Resource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("Klarte ikke å hente mal:", error.message);
    return null;
  }

  return data;
}

export async function getAllResourcesForAdmin(): Promise<Resource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Klarte ikke å hente maler for admin:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Klarte ikke å hente mal:", error.message);
    return null;
  }

  return data;
}
