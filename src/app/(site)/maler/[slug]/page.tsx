import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { DownloadIcon } from "@/components/icons";
import { getPublishedResourceBySlug } from "@/lib/resources";
import { downloadUrl, formatFileSize, resourceKindLabel } from "@/types/resource";

export const revalidate = 0;

export async function generateMetadata(
  props: PageProps<"/maler/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const resource = await getPublishedResourceBySlug(slug);

  if (!resource) return {};

  return {
    title: resource.title,
    description: resource.excerpt ?? undefined,
    openGraph: resource.cover_image_url
      ? { images: [{ url: resource.cover_image_url }] }
      : undefined,
  };
}

export default async function ResourcePage(props: PageProps<"/maler/[slug]">) {
  const { slug } = await props.params;
  const resource = await getPublishedResourceBySlug(slug);

  if (!resource) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/maler" className="text-sm text-black/60 hover:text-black">
        ← Maler og verktøy
      </Link>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-black/40">
        {resourceKindLabel(resource.kind)}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        {resource.title}
      </h1>

      {resource.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
        <img
          src={resource.cover_image_url}
          alt=""
          className="mt-8 w-full object-cover"
        />
      )}

      {resource.excerpt && (
        <p className="mt-8 text-xl font-medium leading-snug text-black/80">
          {resource.excerpt}
        </p>
      )}

      {resource.files.length > 0 && (
        <section
          aria-label="Last ned"
          className="mt-8 rounded-lg border border-black/10 bg-neutral-50 p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-black/50">
            Last ned
          </h2>
          <ul className="mt-3 divide-y divide-black/10">
            {resource.files.map((file) => (
              <li
                key={file.path}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-xs text-black/50">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <a
                  href={downloadUrl(file)}
                  download={file.name}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Last ned
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="prose prose-neutral mt-10 max-w-none prose-headings:font-semibold prose-a:text-black prose-a:underline">
        <ReactMarkdown>{resource.content}</ReactMarkdown>
      </div>
    </article>
  );
}
