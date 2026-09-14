import Link from "next/link";
import { CompactPostList } from "@/components/compact-post-list";
import { CATEGORIES } from "@/lib/categories";
import { getPublishedPosts } from "@/lib/posts";
import { getSiteSettings } from "@/lib/settings";
import type { Post } from "@/types/post";

export const revalidate = 0;

function postsForCategory(posts: Post[], category: string): Post[] {
  const needle = category.toLowerCase();
  return posts.filter((post) =>
    post.tags.some((tag) => tag.toLowerCase() === needle),
  );
}

export default async function HomePage() {
  const [posts, settings] = await Promise.all([
    getPublishedPosts(),
    getSiteSettings(),
  ]);
  const latestPosts = posts.slice(0, 4);

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
                  <h3 className="text-base font-semibold">{category}</h3>
                  <div className="mt-3">
                    <CompactPostList
                      posts={postsForCategory(posts, category)}
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
