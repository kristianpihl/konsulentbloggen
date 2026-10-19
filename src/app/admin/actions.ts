"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { MAX_POST_CONTENT_LENGTH } from "@/types/post";
import {
  isInFuture,
  isoToOsloLocal,
  nextFreeThursdaySlot,
  osloLocalToDate,
} from "@/lib/schedule";
import type { PostInput, PostStatus } from "@/types/post";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type PostFormState = { error: string; success?: boolean } | null;

// Finner neste ledige torsdag kl. 09:00 (norsk tid) som ikke allerede har et
// planlagt innlegg. Returnerer verdi til et datetime-local-felt, eller tom streng.
export async function nextFreeSlot(excludeId?: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "";

  const nowIso = new Date().toISOString();
  let query = supabase
    .from("posts")
    .select("published_at")
    .eq("status", "published")
    .gt("published_at", nowIso);
  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query;
  const taken = (data ?? [])
    .map((row) => row.published_at)
    .filter((v): v is string => typeof v === "string");

  return nextFreeThursdaySlot(new Date(), taken);
}

// Tolker publiseringstidspunktet fra skjemaet (norsk tid). Tom verdi = ingen
// bestemt tid. Returnerer null hvis verdien er ugyldig.
function parsePublishAt(formData: FormData): { value: Date | null; valid: boolean; raw: string } {
  const raw = String(formData.get("publish_at") ?? "").trim();
  if (!raw) return { value: null, valid: true, raw };
  const value = osloLocalToDate(raw);
  return { value, valid: value !== null, raw };
}

function parsePostInput(formData: FormData): PostInput {
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const coverImageUrl = String(formData.get("cover_image_url") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");
  const status = (
    formData.get("status") === "published" ? "published" : "draft"
  ) as PostStatus;

  const tags = [
    ...new Set(
      tagsRaw
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];

  const slug = slugify(slugRaw || title);

  // Feltet «Relatert mal eller verktøy» finnes bare i skjemaet når kolonnen
  // finnes. Er det utelatt, rører vi ikke resource_id.
  const resourceRaw = formData.get("resource_id");

  return {
    title,
    slug,
    excerpt,
    content,
    cover_image_url: coverImageUrl,
    tags,
    status,
    ...(resourceRaw === null ? {} : { resource_id: String(resourceRaw) || null }),
  };
}

function errorMessage(error: { code?: string; message: string }): string {
  if (error.code === "23505") {
    return "Denne slug-en er allerede i bruk av et annet innlegg.";
  }
  return error.message;
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const input = parsePostInput(formData);

  if (!input.title || !input.content || !input.slug) {
    return { error: "Tittel og innhold må fylles ut." };
  }
  if (input.content.length > MAX_POST_CONTENT_LENGTH) {
    return {
      error: `Innholdet er for langt (maks ${MAX_POST_CONTENT_LENGTH} tegn).`,
    };
  }

  const publishAt = parsePublishAt(formData);
  if (!publishAt.valid) {
    return { error: "Ugyldig publiseringstidspunkt." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn." };

  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...input,
      cover_image_url: input.cover_image_url || null,
      published_at:
        input.status === "published"
          ? (publishAt.value ?? new Date()).toISOString()
          : null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: errorMessage(error) };
  }

  revalidatePath("/blog");
  revalidatePath("/");
  redirect(`/admin/${data.id}/edit`);
}

export async function updatePost(
  id: string,
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const input = parsePostInput(formData);

  if (!input.title || !input.content || !input.slug) {
    return { error: "Tittel og innhold må fylles ut." };
  }
  if (input.content.length > MAX_POST_CONTENT_LENGTH) {
    return {
      error: `Innholdet er for langt (maks ${MAX_POST_CONTENT_LENGTH} tegn).`,
    };
  }

  const publishAt = parsePublishAt(formData);
  if (!publishAt.valid) {
    return { error: "Ugyldig publiseringstidspunkt." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  // Uendret tidspunkt i skjemaet beholder den eksakte lagrede verdien.
  const unchanged =
    existing?.published_at &&
    publishAt.raw === isoToOsloLocal(existing.published_at);

  // «Publiser nå»: et allerede utgitt innlegg beholder datoen sin, mens et
  // planlagt (eller nytt) innlegg får tidspunktet nå.
  const publishNow = formData.get("publish_now") === "1";

  let published_at: string | null = null;
  if (input.status === "published") {
    if (publishNow) {
      published_at =
        existing?.published_at && !isInFuture(existing.published_at)
          ? existing.published_at
          : new Date().toISOString();
    } else if (unchanged) published_at = existing.published_at;
    else if (publishAt.value) published_at = publishAt.value.toISOString();
    else published_at = existing?.published_at ?? new Date().toISOString();
  }

  const { error } = await supabase
    .from("posts")
    .update({
      ...input,
      cover_image_url: input.cover_image_url || null,
      published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: errorMessage(error) };
  }

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath(`/blog/${input.slug}`);
  revalidatePath(`/admin/${id}/edit`);
  return { error: "", success: true };
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  await supabase.from("posts").delete().eq("id", id);

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
