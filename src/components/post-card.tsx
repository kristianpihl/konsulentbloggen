import Link from "next/link";
import { formatDate } from "@/lib/slugify";
import type { Post } from "@/types/post";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="border-b border-black/10 py-8 first:pt-0 last:border-b-0">
      <Link href={`/blog/${post.slug}`} className="group block">
        <p className="text-sm text-black/50">{formatDate(post.published_at)}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight group-hover:underline">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-2 text-black/70">{post.excerpt}</p>
        )}
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs text-black/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
