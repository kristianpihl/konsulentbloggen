import Link from "next/link";
import { CompactPostList } from "@/components/compact-post-list";
import { CATEGORIES, categorySlug, postsForCategory } from "@/lib/categories";
import { getPostViewCounts } from "@/lib/analytics";
import { getPublishedPosts } from "@/lib/posts";
import type { Post } from "@/types/post";

export const revalidate = 0;

// Maks antall innlegg vist per liste på forsiden.
// "Se alle →"-lenkene tar deg til sider uten denne begrensningen.
const MAX_PREVIEW_POSTS = 5;

// Sorterer etter antall sidevisninger (mest populære først). Innlegg uten
// visningsdata ennå faller tilbake til nyeste-først, slik at ferske
// innlegg ikke forsvinner nederst før statistikken har rukket å samle seg.
function sortByPopularity(posts: Post[], viewCounts: Map<string, number>): Post[] {
  return [...posts].sort((a, b) => {
    const diff = (viewCounts.get(b.slug) ?? 0) - (viewCounts.get(a.slug) ?? 0);
    if (diff !== 0) return diff;
    return (
      new Date(b.published_at ?? 0).getTime() -
      new Date(a.published_at ?? 0).getTime()
    );
  });
}

export default async function HomePage() {
  const [posts, viewCounts] = await Promise.all([
    getPublishedPosts(),
    getPostViewCounts(),
  ]);
  const [featuredPost, ...rest] = posts;
  const latestPosts = rest.slice(0, MAX_PREVIEW_POSTS);

  return (
    <div>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            {featuredPost ? (
              <Link href={`/blog/${featuredPost.slug}`} className="group block">
                {featuredPost.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
                  <img
                    src={featuredPost.cover_image_url}
                    alt=""
                    className="h-64 w-full rounded-lg border border-black/10 object-cover sm:h-80 lg:h-[28rem]"
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed border-black/15 text-center text-sm text-black/40 sm:h-80 lg:h-[28rem]">
                    Ingen bilde satt for dette innlegget
                  </div>
                )}
                <div className="mt-4">
                  <h1 className="text-2xl font-semibold tracking-tight group-hover:underline">
                    {featuredPost.title}
                  </h1>
                  {featuredPost.excerpt && (
                    <p className="mt-2 text-black/70">{featuredPost.excerpt}</p>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed border-black/15 text-center text-sm text-black/40 sm:h-80 lg:h-[28rem]">
                Ingen innlegg publisert ennå
              </div>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Siste innlegg</h2>
              <Link
                href="/blog"
                className="text-sm text-black/60 hover:text-black"
              >
                Se alle →
              </Link>
            </div>
            <div className="mt-4">
              <CompactPostList posts={latestPosts} />
            </div>
          </div>
        </div>
      </div>

      {posts.length > 0 && (
        <div className="bg-neutral-100 py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-lg font-semibold">Kategorier</h2>
            <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2">
              {CATEGORIES.map((category) => (
                <div key={category}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-semibold">{category}</h3>
                    <Link
                      href={`/kategori/${categorySlug(category)}`}
                      className="text-sm text-black/60 hover:text-black"
                    >
                      Se alle →
                    </Link>
                  </div>
                  <div className="mt-3">
                    <CompactPostList
                      posts={sortByPopularity(
                        postsForCategory(posts, category),
                        viewCounts,
                      ).slice(0, MAX_PREVIEW_POSTS)}
                      emptyLabel="Ingen innlegg i denne kategorien ennå."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
