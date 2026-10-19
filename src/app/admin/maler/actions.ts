"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import {
  MAX_RESOURCE_CONTENT_LENGTH,
  MAX_RESOURCE_FILES,
  RESOURCE_BUCKET,
} from "@/types/resource";
import type {
  ResourceFile,
  ResourceKind,
  ResourceStatus,
} from "@/types/resource";

export type ResourceFormState = { error: string; success?: boolean } | null;

interface ResourceInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  kind: ResourceKind;
  cover_image_url: string;
  best_for: string[];
  key_features: string[];
  files: ResourceFile[];
  status: ResourceStatus;
}

// Godtar bare filer som faktisk ligger i malfil-boksen vår.
function parseFiles(raw: string): ResourceFile[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (item): item is ResourceFile =>
          typeof item === "object" &&
          item !== null &&
          typeof item.name === "string" &&
          typeof item.path === "string" &&
          typeof item.url === "string" &&
          typeof item.size === "number" &&
          typeof item.type === "string" &&
          item.url.includes(`/storage/v1/object/public/${RESOURCE_BUCKET}/`),
      )
      .slice(0, MAX_RESOURCE_FILES);
  } catch {
    return [];
  }
}

// Én verdi per linje, maks 8 stk på maks 80 tegn.
function parseLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(0, 80))
    .slice(0, 8);
}

function parseInput(formData: FormData): ResourceInput {
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "mal");
  const statusRaw = String(formData.get("status") ?? "draft");

  return {
    title,
    slug: slugify(slugRaw || title),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: String(formData.get("content") ?? ""),
    kind: kindRaw === "verktoy" ? "verktoy" : "mal",
    cover_image_url: String(formData.get("cover_image_url") ?? "").trim(),
    best_for: parseLines(String(formData.get("best_for") ?? "")),
    key_features: parseLines(String(formData.get("key_features") ?? "")),
    files: parseFiles(String(formData.get("files") ?? "[]")),
    status: statusRaw === "published" ? "published" : "draft",
  };
}

function validate(input: ResourceInput): string | null {
  if (!input.title || !input.content || !input.slug) {
    return "Tittel og innhold må fylles ut.";
  }
  if (input.content.length > MAX_RESOURCE_CONTENT_LENGTH) {
    return `Innholdet kan ikke være lengre enn ${MAX_RESOURCE_CONTENT_LENGTH} tegn.`;
  }
  return null;
}

function errorMessage(error: { code?: string; message: string }): string {
  if (error.code === "23505") {
    return "Denne slug-en er allerede i bruk av en annen mal eller et annet verktøy.";
  }
  if (error.code === "42P01") {
    return "Tabellen finnes ikke ennå. Kjør migrasjon 011_resources.sql i Supabase.";
  }
  if (/best_for|key_features/.test(error.message)) {
    return "Kolonnene mangler. Kjør migrasjon 012_resources_extras.sql i Supabase.";
  }
  return error.message;
}

function revalidateResources() {
  revalidatePath("/maler");
  revalidatePath("/maler/[slug]", "page");
  revalidatePath("/admin/maler");
}

export async function createResource(
  _prevState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const input = parseInput(formData);
  const invalid = validate(input);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn." };

  const { data, error } = await supabase
    .from("resources")
    .insert({
      ...input,
      excerpt: input.excerpt || null,
      cover_image_url: input.cover_image_url || null,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return { error: errorMessage(error) };

  revalidateResources();
  redirect(`/admin/maler/${data.id}/edit`);
}

export async function updateResource(
  id: string,
  _prevState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const input = parseInput(formData);
  const invalid = validate(input);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn." };

  const { data: existing } = await supabase
    .from("resources")
    .select("published_at, files")
    .eq("id", id)
    .maybeSingle();

  // Beholder opprinnelig publiseringsdato hvis den allerede er publisert.
  const published_at =
    input.status === "published"
      ? (existing?.published_at ?? new Date().toISOString())
      : null;

  const { error } = await supabase
    .from("resources")
    .update({
      ...input,
      excerpt: input.excerpt || null,
      cover_image_url: input.cover_image_url || null,
      published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: errorMessage(error) };

  // Rydder bort filer som ble fjernet fra malen.
  const keep = new Set(input.files.map((file) => file.path));
  const removed = ((existing?.files ?? []) as ResourceFile[])
    .map((file) => file.path)
    .filter((path) => !keep.has(path));
  if (removed.length > 0) {
    await supabase.storage.from(RESOURCE_BUCKET).remove(removed);
  }

  revalidateResources();
  return { error: "", success: true };
}

export async function deleteResource(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: existing } = await supabase
    .from("resources")
    .select("files")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("resources").delete().eq("id", id);

  const paths = ((existing?.files ?? []) as ResourceFile[]).map(
    (file) => file.path,
  );
  if (paths.length > 0) {
    await supabase.storage.from(RESOURCE_BUCKET).remove(paths);
  }

  revalidateResources();
  redirect("/admin/maler");
}
