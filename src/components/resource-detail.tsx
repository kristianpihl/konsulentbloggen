import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { DownloadIcon } from "@/components/icons";
import { ResourceKindBadge } from "@/components/resource-card";
import { downloadUrl, fileTypeLabel, formatFileSize } from "@/types/resource";
import type { Resource } from "@/types/resource";

function SideList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
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

export function ResourceDetail({ resource }: { resource: Resource }) {
  const bestFor = resource.best_for ?? [];
  const keyFeatures = resource.key_features ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Link href="/maler" className="text-sm font-medium text-blue-700 hover:underline">
            ← Alle maler og verktøy
          </Link>

          <div className="mt-8">
            <ResourceKindBadge kind={resource.kind} />
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {resource.title}
          </h1>

          {resource.excerpt && (
            <p className="mt-6 text-lg leading-relaxed text-black/75">
              {resource.excerpt}
            </p>
          )}

          {resource.files.length > 0 && (
            <ul className="mt-8 space-y-4" aria-label="Last ned">
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

          <SideList title="Passer best for" items={bestFor} />
          <SideList title="Nøkkelfunksjoner" items={keyFeatures} />
        </aside>

        <article className="min-w-0">
          {resource.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
            <img
              src={resource.cover_image_url}
              alt=""
              className="w-full overflow-hidden rounded-xl border border-black/15 shadow-sm"
            />
          )}

          <div className="prose prose-neutral prose-lg mt-10 max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-3xl prose-a:text-black prose-a:underline">
            <ReactMarkdown>{resource.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}
