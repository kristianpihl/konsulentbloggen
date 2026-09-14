import Link from "next/link";
import { formatDate } from "@/lib/slugify";
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
          <Link href={`/blog/${post.slug}`} className="group block">
            <p className="text-xs text-black/50">
              {formatDate(post.published_at)}
            </p>
            <h3 className="mt-0.5 font-medium leading-snug group-hover:underline">
              {post.title}
            </h3>
          </Link>
        </li>
      ))}
    </ul>
  );
}
