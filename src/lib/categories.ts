import { slugify } from "@/lib/slugify";
import type { Post } from "@/types/post";

// Kategoriene forsiden grupperer artikler etter. Må matche (uavhengig av
// store/små bokstaver) en tag du setter på innlegget i admin-panelet for
// at det skal havne i riktig kategori.
export const CATEGORIES = [
  "Produktledelse",
  "Teamledelse",
  "Forretningsutvikling",
  "Digitalisering",
  "Endringsledelse",
  "Karriere",
] as const;

// URL-vennlig versjon av kategorinavnet, brukt i /kategori/[slug].
export function categorySlug(category: string): string {
  return slugify(category);
}

// Finn kategorien som matcher en slug fra URL-en, hvis noen.
export function findCategoryBySlug(slug: string): string | undefined {
  return CATEGORIES.find((category) => categorySlug(category) === slug);
}

export function postsForCategory(posts: Post[], category: string): Post[] {
  const needle = category.toLowerCase();
  return posts.filter((post) =>
    post.tags.some((tag) => tag.toLowerCase() === needle),
  );
}
