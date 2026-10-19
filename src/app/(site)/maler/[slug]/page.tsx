import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceDetail } from "@/components/resource-detail";
import { getPublishedResourceBySlug } from "@/lib/resources";

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

  return <ResourceDetail resource={resource} />;
}
