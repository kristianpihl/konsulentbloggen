import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/posts";
import { formatDate } from "@/lib/slugify";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { deletePost } from "./actions";

export const revalidate = 0;

export default async function AdminDashboard() {
  const posts = await getAllPostsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Innlegg</h1>
        <Link
          href="/admin/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
        >
          Nytt innlegg
        </Link>
      </div>

      <div className="mt-8 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {posts.length === 0 && (
          <p className="px-4 py-6 text-sm text-black/50">Ingen innlegg ennå.</p>
        )}
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between gap-4 px-4 py-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              {post.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
                <img
                  src={post.cover_image_url}
                  alt=""
                  className="h-12 w-14 shrink-0 rounded-md border border-black/10 object-cover"
                />
              ) : (
                <div className="h-12 w-14 shrink-0 rounded-md border border-black/10 bg-black/5" />
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{post.title}</p>
                <p className="mt-0.5 text-xs text-black/50">
                  <span
                    className={
                      post.status === "published"
                        ? "text-green-700"
                        : "text-amber-700"
                    }
                  >
                    {post.status === "published" ? "Publisert" : "Utkast"}
                  </span>
                  {post.published_at && <> · {formatDate(post.published_at)}</>}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-sm">
              <Link
                href={`/admin/${post.id}/edit`}
                className="text-black/70 hover:text-black"
              >
                Rediger
              </Link>
              <form action={deletePost.bind(null, post.id)}>
                <DeletePostButton />
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
