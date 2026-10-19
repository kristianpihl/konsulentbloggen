import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { DownloadIcon } from "@/components/icons";
import { ResourceBadge } from "@/components/resource-card";
import { downloadUrl, fileTypeLabel, formatFileSize } from "@/types/resource";
import type { Post } from "@/types/post";
import type { Resource } from "@/types/resource";

function SideList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-black/55">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-black/80">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

// Mobil (én kolonne), fra topp til bunn: hovedbilde, overskrift, ingress,
// nedlastingsknapper, tekst, lister og relaterte artikler. På bred skjerm
// ligger overskrift, ingress, knapper og lister i en smal venstrekolonne, og
// bilde og tekst i en bred høyrekolonne. Det styres med `contents` + `order`
// på mobil, slik at samme elementer kan stå i to ulike rekkefølger.
export function ResourceDetail({
  resource,
  relatedPosts = [],
}: {
  resource: Resource;
  relatedPosts?: Post[];
}) {
  const bestFor = resource.best_for ?? [];
  const keyFeatures = resource.key_features ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <aside className="contents lg:sticky lg:top-8 lg:block lg:self-start">
          <Link
            href="/maler"
            className="order-first text-sm font-medium text-blue-700 hover:underline"
          >
            ← Alle maler og verktøy
          </Link>

          <div className="order-2 lg:mt-8">
            <ResourceBadge category={resource.category} />
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {resource.title}
            </h1>
            {resource.excerpt && (
              <p className="mt-6 text-lg leading-relaxed text-black/75">
                {resource.excerpt}
              </p>
            )}
          </div>

          {resource.files.length > 0 && (
            <ul className="order-3 space-y-4 lg:mt-8" aria-label="Last ned">
              {resource.files.map((file) => (
                <li key={file.path}>
                  <a
                    href={downloadUrl(file)}
                    download={file.name}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-7 py-3.5 text-base font-semibold text-white hover:bg-blue-800"
                  >
                    <DownloadIcon className="h-5 w-5" />
                    Last ned {fileTypeLabel(file)}
                  </a>
                  <p className="mt-2 truncate pl-2 text-xs text-black/50">
                    {file.name} · {formatFileSize(file.size)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {(bestFor.length > 0 || keyFeatures.length > 0) && (
            <div className="order-5 space-y-10 lg:mt-10">
              <SideList title="Passer best for" items={bestFor} />
              <SideList title="Nøkkelfunksjoner" items={keyFeatures} />
            </div>
          )}
        </aside>

        <article className="contents lg:block lg:min-w-0">
          {resource.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
            <img
              src={resource.cover_image_url}
              alt=""
              className="order-1 w-full overflow-hidden rounded-xl border border-black/15 shadow-sm"
            />
          )}

          <div className="prose prose-neutral prose-lg order-4 max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-3xl prose-a:text-black prose-a:underline lg:mt-10">
            <ReactMarkdown>{resource.content}</ReactMarkdown>
          </div>

          {relatedPosts.length > 0 && (
            <section className="order-6 border-t border-black/10 pt-8 lg:mt-14">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-black/55">
                {relatedPosts.length === 1 ? "Relatert artikkel" : "Relaterte artikler"}
              </h2>
              <ul className="mt-4 space-y-3">
                {relatedPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group block rounded-2xl border border-black/15 p-5 hover:shadow-md"
                    >
                      <p className="text-lg font-bold leading-snug group-hover:underline">
                        {post.title}
                      </p>
                      {post.excerpt && (
                        <p className="mt-1 line-clamp-2 text-sm text-black/65">
                          {post.excerpt}
                        </p>
                      )}
                      <span className="mt-3 inline-block text-sm font-medium text-blue-700">
                        Les artikkelen →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
