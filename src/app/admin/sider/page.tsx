import Link from "next/link";
import { getAllPagesForAdmin } from "@/lib/pages";
import { DeletePostButton } from "@/components/admin/delete-post-button";
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
          <div
            key={page.id}
            className="flex items-center justify-between gap-4 px-4 py-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{page.title}</p>
              <p className="mt-0.5 text-xs text-black/50">/{page.slug}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-sm">
              <Link
                href={`/admin/sider/${page.id}/edit`}
                className="text-black/70 hover:text-black"
              >
                Rediger
              </Link>
              <form action={deletePage.bind(null, page.id)}>
                <DeletePostButton confirmMessage="Slette denne siden? Den forsvinner også fra toppmenyen. Dette kan ikke angres." />
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
