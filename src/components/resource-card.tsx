import Link from "next/link";
import { DownloadIcon } from "@/components/icons";
import { resourceKindLabel } from "@/types/resource";
import type { Resource } from "@/types/resource";

export function ResourceCard({ resource }: { resource: Resource }) {
  const fileCount = resource.files.length;

  return (
    <article>
      <Link href={`/maler/${resource.slug}`} className="group block">
        {resource.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
          <img
            src={resource.cover_image_url}
            alt=""
            className="aspect-video w-full rounded-md border border-black/10 object-cover"
          />
        ) : (
          <div className="aspect-video w-full rounded-md border border-black/10 bg-black/5" />
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-black/50">
          <span className="rounded-full bg-black/5 px-2.5 py-0.5 font-medium text-black/70">
            {resourceKindLabel(resource.kind)}
          </span>
          {fileCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <DownloadIcon className="h-3.5 w-3.5" />
              {fileCount} {fileCount === 1 ? "fil" : "filer"}
            </span>
          )}
        </div>
        <h2 className="mt-2 font-semibold tracking-tight group-hover:underline">
          {resource.title}
        </h2>
        {resource.excerpt && (
          <p className="mt-1 line-clamp-3 text-sm text-black/70">
            {resource.excerpt}
          </p>
        )}
      </Link>
    </article>
  );
}
