import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/post";
import type { Resource } from "@/types/resource";

// Publiserte maler og verktøy, nyeste først.
export async function getPublishedResources(): Promise<Resource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

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

export async function getPublishedResourceById(
  id: string,
): Promise<Resource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("Klarte ikke å hente mal:", error.message);
    return null;
  }

  return data;
}

// Publiserte innlegg som er lenket til en gitt mal eller et gitt verktøy.
export async function getPostsForResource(resourceId: string): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("resource_id", resourceId)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error) {
    // Kolonnen finnes ikke før migrasjon 013 er kjørt — da finnes heller ingen lenker.
    return [];
  }

  return data ?? [];
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

// Valg til «Relatert mal eller verktøy» i innleggsskjemaet. Returnerer null
// hvis lenke-kolonnen ikke finnes ennå (migrasjon 013 ikke kjørt), slik at
// feltet da skjules i stedet for å bryte lagring av innlegg.
export async function getResourceLinkOptions(): Promise<
  { id: string; title: string }[] | null
> {
  const supabase = await createClient();
  const probe = await supabase.from("posts").select("resource_id").limit(1);
  if (probe.error) return null;

  const { data, error } = await supabase
    .from("resources")
    .select("id, title")
    .order("title", { ascending: true });

  if (error) return null;
  return data ?? [];
}
