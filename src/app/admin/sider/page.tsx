import Link from "next/link";
import { getAllPagesForAdmin } from "@/lib/pages";
import { AdminItemRow } from "@/components/admin/admin-item-row";
import { deletePage } from "./actions";

export const revalidate = 0;

export default async function AdminPagesDashboard() {
  const pages = await getAllPagesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sider</h1>
          <p className="mt-1 text-sm text-black/60">
            Statiske sider som «Om meg». Alle sider vises automatisk som
            lenker i toppmenyen.
          </p>
        </div>
        <Link
          href="/admin/sider/new"
          className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
        >
          Ny side
        </Link>
      </div>

      <div className="mt-8 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {pages.length === 0 && (
          <p className="px-4 py-6 text-sm text-black/50">Ingen sider ennå.</p>
        )}
        {pages.map((page) => (
          <AdminItemRow
            key={page.id}
            imageUrl={page.cover_image_url}
            title={page.title}
            editHref={`/admin/sider/${page.id}/edit`}
            deleteAction={deletePage.bind(null, page.id)}
            deleteConfirmMessage="Slette denne siden? Den forsvinner også fra toppmenyen. Dette kan ikke angres."
            meta={`/${page.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
