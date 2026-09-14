import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/posts";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 0;

export default async function HomePage() {
  const [posts, settings] = await Promise.all([
    getPublishedPosts(),
    getSiteSettings(),
  ]);
  const latestPosts = posts.slice(0, 4);

  return (
    <div>
      {settings.hero_image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
        <img
          src={settings.hero_image_url}
          alt=""
          className="h-64 w-full object-cover sm:h-80 md:h-[28rem]"
        />
      )}

      <div className="mx-auto max-w-3xl px-6 py-16">
        <section>
          <p className="text-sm font-medium text-black/50">{siteConfig.role}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {siteConfig.name}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-black/70">
            {siteConfig.tagline}
          </p>
          <div className="mt-6 flex gap-4 text-sm">
            <Link
              href="/blog"
              className="rounded-md bg-black px-4 py-2 font-medium text-white hover:bg-black/80"
            >
              Les bloggen
            </Link>
            <Link
              href="/om"
              className="rounded-md border border-black/15 px-4 py-2 font-medium hover:bg-black/5"
            >
              Om meg
            </Link>
          </div>
        </section>
      </div>

      {latestPosts.length > 0 && (
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <section>
            <div className="mb-8 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Siste innlegg</h2>
              <Link
                href="/blog"
                className="text-sm text-black/60 hover:text-black"
              >
                Se alle →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
