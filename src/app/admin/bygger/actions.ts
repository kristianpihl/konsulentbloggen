"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { CATEGORIES } from "@/lib/categories";
import { getStyleGuide } from "@/lib/style-guide";
import {
  MAX_BUILDER_INPUT_LENGTH,
  MAX_PRINCIPLES_LENGTH,
  generateArticle,
} from "@/lib/content-builder";

export type BuilderState = { error: string } | null;
export type StyleGuideState = { error: string; success?: boolean } | null;

export async function createDraftFromBuilder(
  _prevState: BuilderState,
  formData: FormData,
): Promise<BuilderState> {
  const problem = String(formData.get("problem") ?? "").trim();
  const solution = String(formData.get("solution") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const category = (CATEGORIES as readonly string[]).includes(categoryRaw)
    ? categoryRaw
    : null;

  if (!problem || !solution) {
    return { error: "Fyll ut både problem/situasjon og løsning." };
  }
  if (
    problem.length > MAX_BUILDER_INPUT_LENGTH ||
    solution.length > MAX_BUILDER_INPUT_LENGTH
  ) {
    return {
      error: `Hvert felt kan maks være ${MAX_BUILDER_INPUT_LENGTH} tegn.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn." };

  const principles = await getStyleGuide();
  const article = await generateArticle({ problem, solution, category, principles });

  const baseSlug = slugify(article.title) || "nytt-innlegg";
  for (let attempt = 1; attempt <= 6; attempt++) {
    const slug = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
    const { data, error } = await supabase
      .from("posts")
      .insert({
        slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        tags: category ? [category] : [],
        status: "draft",
        published_at: null,
      })
      .select("id")
      .single();

    if (!error && data) {
      revalidatePath("/admin");
      redirect(`/admin/${data.id}/edit`);
    }
    if (error?.code !== "23505") {
      return { error: error?.message ?? "Klarte ikke å lagre utkastet." };
    }
  }

  return { error: "Fant ingen ledig slug for utkastet. Prøv en annen formulering." };
}

export async function saveStyleGuide(
  _prevState: StyleGuideState,
  formData: FormData,
): Promise<StyleGuideState> {
  const principles = String(formData.get("principles") ?? "").trim();

  if (!principles) {
    return { error: "Prinsippene kan ikke være tomme." };
  }
  if (principles.length > MAX_PRINCIPLES_LENGTH) {
    return { error: `Maks ${MAX_PRINCIPLES_LENGTH} tegn.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn." };

  const { error } = await supabase.from("style_guide").upsert({
    id: "default",
    principles,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/bygger/prinsipper");
  return { error: "", success: true };
}
