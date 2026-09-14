import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArticleActions } from "@/components/article-actions";
import { formatDate } from "@/lib/slugify";
import { getPublishedPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 0;

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: post.cover_image_url
      ? { images: [{ url: post.cover_image_url }] }
      : undefined,
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) notFound();

  // Vis "Oppdatert" kun hvis innlegget faktisk er endret en god stund
  // etter at det ble opprettet (ikke bare avrundingsstøy fra lagring).
  const wasUpdated =
    new Date(post.updated_at).getTime() -
      new Date(post.created_at).getTime() >
    60_000;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        {post.title}
      </h1>

      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
        <img
          src={post.cover_image_url}
          alt=""
          className="mt-8 w-full object-cover"
        />
      )}

      {post.excerpt && (
        <p className="mt-8 text-xl font-medium leading-snug text-black/80">
          {post.excerpt}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-1 text-sm text-black/60">
        <p>
          <span className="font-semibold uppercase tracking-wide text-black/40">
            Tekst:
          </span>{" "}
          {siteConfig.name}
        </p>
        <p>
          <span className="font-semibold uppercase tracking-wide text-black/40">
            Publisert:
          </span>{" "}
          {formatDate(post.published_at)}
          {wasUpdated && (
            <>
              <span className="mx-2 text-black/30">·</span>
              <span className="font-semibold uppercase tracking-wide text-black/40">
                Oppdatert:
              </span>{" "}
              {formatDate(post.updated_at)}
            </>
          )}
        </p>
        {post.tags.length > 0 && (
          <p>
            <span className="font-semibold uppercase tracking-wide text-black/40">
              Tema:
            </span>{" "}
            {post.tags.join(", ")}
          </p>
        )}
      </div>

      <hr className="mt-6 border-black/10" />

      <ArticleActions title={post.title} />

      <hr className="border-black/10" />

      <div className="prose prose-neutral mt-8 max-w-none prose-headings:font-semibold prose-a:text-black prose-a:underline">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
