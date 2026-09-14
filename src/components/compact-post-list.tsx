import Link from "next/link";
import type { Post } from "@/types/post";

export function CompactPostList({
  posts,
  emptyLabel = "Ingen innlegg ennå.",
}: {
  posts: Post[];
  emptyLabel?: string;
}) {
  if (posts.length === 0) {
    return <p className="text-sm text-black/50">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-black/10">
      {posts.map((post) => (
        <li key={post.id} className="py-3 first:pt-0 last:pb-0">
          <Link href={`/blog/${post.slug}`} className="group flex items-center gap-3">
            {post.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
              <img
                src={post.cover_image_url}
                alt=""
                className="h-14 w-16 shrink-0 rounded-md border border-black/10 object-cover"
              />
            ) : (
              <div className="h-14 w-16 shrink-0 rounded-md border border-black/10 bg-black/5" />
            )}
            <div className="min-w-0">
              <h3 className="font-medium leading-snug group-hover:underline">
                {post.title}
              </h3>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
