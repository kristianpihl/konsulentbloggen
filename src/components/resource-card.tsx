import Link from "next/link";
import { ToolboxIcon } from "@/components/icons";
import type { Resource } from "@/types/resource";

export function ResourceBadge({ category }: { category: string | null }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/55">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-white">
        <ToolboxIcon className="h-4 w-4" />
      </span>
      {category ?? "Mal og verktøy"}
    </span>
  );
}

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article>
      <Link
        href={`/maler/${resource.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-black/15 bg-white transition-shadow hover:shadow-lg"
      >
        {resource.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
          <img
            src={resource.cover_image_url}
            alt=""
            className="aspect-[16/10] w-full border-b border-black/10 object-cover"
          />
        ) : (
          <div className="aspect-[16/10] w-full border-b border-black/10 bg-neutral-100" />
        )}

        <div className="flex flex-1 flex-col p-6">
          <ResourceBadge category={resource.category} />
          <h2 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight">
            {resource.title}
          </h2>
          {resource.excerpt && (
            <p className="mt-3 line-clamp-4 leading-relaxed text-black/70">
              {resource.excerpt}
            </p>
          )}
          <span className="mt-auto pt-6 font-medium text-blue-700 group-hover:underline">
            Les mer →
          </span>
        </div>
      </Link>
    </article>
  );
}

// Liten lenkeboks under en artikkel som peker til en relatert mal eller et relatert verktøy.
export function RelatedResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link
      href={`/maler/${resource.slug}`}
      className="group mt-12 flex items-center gap-5 rounded-2xl border border-black/15 p-4 hover:shadow-md"
    >
      {resource.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
        <img
          src={resource.cover_image_url}
          alt=""
          className="hidden h-24 w-40 shrink-0 rounded-lg border border-black/10 object-cover sm:block"
        />
      ) : null}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
          Mal og verktøy
        </p>
        <p className="mt-1 text-lg font-bold leading-snug group-hover:underline">
          {resource.title}
        </p>
        <span className="mt-2 inline-block text-sm font-medium text-blue-700">
          Se og last ned →
        </span>
      </div>
    </Link>
  );
}
