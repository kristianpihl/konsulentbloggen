"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { RESERVED_PAGE_SLUGS } from "@/types/page";
import type { StaticPageInput } from "@/types/page";

export type PageFormState = { error: string; success?: boolean } | null;

function parsePageInput(formData: FormData): StaticPageInput {
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const content = String(formData.get("content") ?? "");

  const slug = slugify(slugRaw || title);

  return { title, slug, content };
}

function errorMessage(error: { code?: string; message: string }): string {
  if (error.code === "23505") {
    return "Denne slug-en er allerede i bruk av en annen side.";
  }
  return error.message;
}

export async function createPage(
  _prevState: PageFormState,
  formData: FormData,
): Promise<PageFormState> {
  const input = parsePageInput(formData);

  if (!input.title || !input.content || !input.slug) {
    return { error: "Tittel og innhold må fylles ut." };
  }
  if (RESERVED_PAGE_SLUGS.includes(input.slug)) {
    return {
      error: `«${input.slug}» er reservert av en annen del av siden. Velg en annen slug.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn." };

  const { data, error } = await supabase
    .from("pages")
    .insert(input)
    .select("id")
    .single();

  if (error) {
    return { error: errorMessage(error) };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/sider/${data.id}/edit`);
}

export async function updatePage(
  id: string,
  _prevState: PageFormState,
  formData: FormData,
): Promise<PageFormState> {
  const input = parsePageInput(formData);

  if (!input.title || !input.content || !input.slug) {
    return { error: "Tittel og innhold må fylles ut." };
  }
  if (RESERVED_PAGE_SLUGS.includes(input.slug)) {
    return {
      error: `«${input.slug}» er reservert av en annen del av siden. Velg en annen slug.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pages")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: errorMessage(error) };
  }

  revalidatePath("/", "layout");
  return { error: "", success: true };
}

export async function deletePage(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  await supabase.from("pages").delete().eq("id", id);

  revalidatePath("/", "layout");
  revalidatePath("/admin/sider");
  redirect("/admin/sider");
}
