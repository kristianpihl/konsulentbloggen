import Link from "next/link";
import { PostsIcon, ToolboxIcon } from "@/components/icons";
import { resourceKindLabel } from "@/types/resource";
import type { Resource } from "@/types/resource";

export function ResourceKindBadge({ kind }: { kind: Resource["kind"] }) {
  const Icon = kind === "verktoy" ? ToolboxIcon : PostsIcon;

  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/55">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-white">
        <Icon className="h-4 w-4" />
      </span>
      {resourceKindLabel(kind)}
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
          <ResourceKindBadge kind={resource.kind} />
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
