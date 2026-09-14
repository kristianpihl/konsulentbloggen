import Link from "next/link";
import { formatDate } from "@/lib/slugify";
import type { Post } from "@/types/post";

export function PostCard({ post }: { post: Post }) {
  return (
    <article>
      <Link href={`/blog/${post.slug}`} className="group flex gap-5">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
          <img
            src={post.cover_image_url}
            alt=""
            className="h-28 w-36 shrink-0 rounded-md border border-black/10 object-cover sm:h-32 sm:w-44"
          />
        ) : (
          <div className="h-28 w-36 shrink-0 rounded-md border border-black/10 bg-black/5 sm:h-32 sm:w-44" />
        )}
        <div className="min-w-0">
          <p className="text-sm text-black/50">{formatDate(post.published_at)}</p>
          <h2 className="mt-1 font-semibold tracking-tight group-hover:underline">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-black/70">
              {post.excerpt}
            </p>
          )}
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs text-black/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
