import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/posts";
import { formatDate } from "@/lib/slugify";
import { AdminItemRow } from "@/components/admin/admin-item-row";
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
          <AdminItemRow
            key={post.id}
            imageUrl={post.cover_image_url}
            title={post.title}
            editHref={`/admin/${post.id}/edit`}
            deleteAction={deletePost.bind(null, post.id)}
            deleteConfirmMessage="Slette dette innlegget? Dette kan ikke angres."
            meta={
              <>
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
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
