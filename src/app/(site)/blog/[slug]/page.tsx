import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { formatDate } from "@/lib/slugify";
import { getPublishedPostBySlug } from "@/lib/posts";

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
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-black/50">{formatDate(post.published_at)}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {post.title}
      </h1>
      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs text-black/60"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="prose prose-neutral mt-10 max-w-none prose-headings:font-semibold prose-a:text-black prose-a:underline">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
