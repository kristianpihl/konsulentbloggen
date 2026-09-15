"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { MAX_POST_CONTENT_LENGTH } from "@/types/post";
import type { PostInput, PostStatus } from "@/types/post";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type PostFormState = { error: string; success?: boolean } | null;

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

  return {
    title,
    slug,
    excerpt,
    content,
    cover_image_url: coverImageUrl,
    tags,
    status,
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
        input.status === "published" ? new Date().toISOString() : null,
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

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const published_at =
    input.status === "published"
      ? (existing?.published_at ?? new Date().toISOString())
      : null;

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
