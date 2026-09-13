import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blogg",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Blogg</h1>
      <p className="mt-2 text-black/60">
        Korte poster om ting jeg møter på i arbeidslivet.
      </p>

      <div className="mt-10">
        {posts.length === 0 ? (
          <p className="text-black/50">Ingen innlegg publisert ennå.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
