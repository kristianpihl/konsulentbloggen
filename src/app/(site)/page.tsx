import Link from "next/link";
import { CompactPostList } from "@/components/compact-post-list";
import { CATEGORIES, categorySlug, postsForCategory } from "@/lib/categories";
import { getPublishedPosts } from "@/lib/posts";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 0;

// Maks antall innlegg vist per liste på forsiden (nyeste publiserte først).
// "Se alle →"-lenkene tar deg til sider uten denne begrensningen.
const MAX_PREVIEW_POSTS = 5;

export default async function HomePage() {
  const [posts, settings] = await Promise.all([
    getPublishedPosts(),
    getSiteSettings(),
  ]);
  const latestPosts = posts.slice(0, MAX_PREVIEW_POSTS);

  return (
    <div>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            {settings.hero_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
              <img
                src={settings.hero_image_url}
                alt=""
                className="h-64 w-full rounded-lg border border-black/10 object-cover sm:h-80 lg:h-[28rem]"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed border-black/15 text-center text-sm text-black/40 sm:h-80 lg:h-[28rem]">
                Last opp et hovedbilde under Innstillinger i admin-panelet
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
                      posts={postsForCategory(posts, category).slice(
                        0,
                        MAX_PREVIEW_POSTS,
                      )}
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
