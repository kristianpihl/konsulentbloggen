import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/post";

// Hent alle publiserte innlegg, nyeste først. Planlagte innlegg (publiseringstid
// frem i tid) skjules til tidspunktet er passert. Brukes på forsiden og bloggsiden.
export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Klarte ikke å hente publiserte innlegg:", error.message);
    return [];
  }

  return data ?? [];
}

// Hent ett publisert innlegg via slug. Brukes på enkeltinnleggsiden.
export async function getPublishedPostBySlug(
  slug: string,
): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("Klarte ikke å hente innlegg:", error.message);
    return null;
  }

  return data;
}

// Hent alle innlegg (utkast + publiserte) for admin-dashbordet.
export async function getAllPostsForAdmin(): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Klarte ikke å hente innlegg for admin:", error.message);
    return [];
  }

  return data ?? [];
}

// Hent ett innlegg via id, uavhengig av status. Brukes i redigeringsskjemaet.
export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Klarte ikke å hente innlegg:", error.message);
    return null;
  }

  return data;
}
