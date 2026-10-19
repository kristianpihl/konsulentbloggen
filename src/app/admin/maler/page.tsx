import Link from "next/link";
import { AdminItemRow } from "@/components/admin/admin-item-row";
import { getAllResourcesForAdmin } from "@/lib/resources";
import { resourceKindLabel } from "@/types/resource";
import { deleteResource } from "./actions";

export const revalidate = 0;

export default async function AdminResourcesDashboard() {
  const resources = await getAllResourcesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Maler og verktøy</h1>
          <p className="mt-1 text-sm text-black/60">
            Artikler med nedlastbare filer. Publiserte vises under «Maler og
            verktøy» i toppmenyen.
          </p>
        </div>
        <Link
          href="/admin/maler/new"
          className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
        >
          Ny mal eller verktøy
        </Link>
      </div>

      <div className="mt-8 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {resources.length === 0 && (
          <p className="px-4 py-6 text-sm text-black/50">
            Ingenting her ennå. Kjør migrasjon 011 i Supabase hvis du får feil,
            og opprett så din første mal.
          </p>
        )}
        {resources.map((resource) => (
          <AdminItemRow
            key={resource.id}
            imageUrl={resource.cover_image_url}
            title={resource.title}
            editHref={`/admin/maler/${resource.id}/edit`}
            deleteAction={deleteResource.bind(null, resource.id)}
            deleteConfirmMessage="Slette denne? Filene slettes også, og det kan ikke angres."
            meta={
              <>
                {resourceKindLabel(resource.kind)} ·{" "}
                {resource.status === "published" ? "Publisert" : "Utkast"} ·{" "}
                {resource.files.length}{" "}
                {resource.files.length === 1 ? "fil" : "filer"}
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
