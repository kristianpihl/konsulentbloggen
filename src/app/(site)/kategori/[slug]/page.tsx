import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/category-icons";
import { PostCard } from "@/components/post-card";
import { findCategoryBySlug, postsForCategory } from "@/lib/categories";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 0;

export async function generateMetadata(
  props: PageProps<"/kategori/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = findCategoryBySlug(slug);

  return { title: category ?? "Kategori" };
}

export default async function CategoryPage(
  props: PageProps<"/kategori/[slug]">,
) {
  const { slug } = await props.params;
  const category = findCategoryBySlug(slug);

  if (!category) notFound();

  const posts = postsForCategory(await getPublishedPosts(), category);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm text-black/50">Kategori</p>
      <h1 className="mt-1 flex items-center gap-3 text-2xl font-semibold tracking-tight">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-black text-white">
          <CategoryIcon category={category} className="h-5 w-5" />
        </span>
        {category}
      </h1>

      <div className="mt-10">
        {posts.length === 0 ? (
          <p className="text-black/50">Ingen innlegg i denne kategorien ennå.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
