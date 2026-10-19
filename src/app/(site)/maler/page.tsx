import type { Metadata } from "next";
import Link from "next/link";
import { ResourceCard } from "@/components/resource-card";
import { getPublishedResources } from "@/lib/resources";
import { RESOURCE_KINDS } from "@/types/resource";
import type { ResourceKind } from "@/types/resource";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Maler og verktøy",
  description:
    "Maler og verktøy jeg bruker i arbeidet med produkt, team og endring. Les hvordan de brukes, og last dem ned.",
};

export default async function ResourcesPage(props: PageProps<"/maler">) {
  const { type } = await props.searchParams;
  const typeParam = Array.isArray(type) ? type[0] : type;
  const activeKind = RESOURCE_KINDS.find((item) => item.value === typeParam)
    ?.value as ResourceKind | undefined;

  const resources = await getPublishedResources(activeKind);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Maler og verktøy</h1>
      <p className="mt-2 max-w-2xl text-black/60">
        Maler og verktøy jeg bruker i arbeidet med produkt, team og endring. Les
        hvordan de brukes, og last dem ned.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 text-sm">
        <FilterLink href="/maler" active={!activeKind} label="Alle" />
        {RESOURCE_KINDS.map((kind) => (
          <FilterLink
            key={kind.value}
            href={`/maler?type=${kind.value}`}
            active={activeKind === kind.value}
            label={kind.plural}
          />
        ))}
      </div>

      <div className="mt-10">
        {resources.length === 0 ? (
          <p className="text-black/50">Ingenting publisert her ennå.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 ${
        active
          ? "border-black bg-black text-white"
          : "border-black/15 text-black/70 hover:bg-black/5"
      }`}
    >
      {label}
    </Link>
  );
}
