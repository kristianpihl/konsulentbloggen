import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getPageBySlug } from "@/lib/pages";

export const revalidate = 0;

export async function generateMetadata(
  props: PageProps<"/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await getPageBySlug(slug);

  if (!page) return {};

  return { title: page.title };
}

export default async function StaticPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const page = await getPageBySlug(slug);

  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{page.title}</h1>
      <div className="prose prose-neutral mt-8 max-w-none prose-headings:font-semibold prose-a:text-black prose-a:underline">
        <ReactMarkdown>{page.content}</ReactMarkdown>
      </div>
    </div>
  );
}
