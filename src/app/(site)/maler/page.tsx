import type { Metadata } from "next";
import Link from "next/link";
import { ResourceCard } from "@/components/resource-card";
import { CATEGORIES } from "@/lib/categories";
import { getPublishedResources } from "@/lib/resources";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Maler og verktøy",
  description:
    "Maler og verktøy jeg bruker i arbeidet med produkt, team og endring. Les hvordan de brukes, og last dem ned.",
};

export default async function ResourcesPage(props: PageProps<"/maler">) {
  const { kategori } = await props.searchParams;
  const kategoriParam = Array.isArray(kategori) ? kategori[0] : kategori;

  const all = await getPublishedResources();

  // Filtrene er de samme kategoriene som på artiklene.
  const activeCategory = CATEGORIES.find((category) => category === kategoriParam);
  const resources = activeCategory
    ? all.filter((resource) => resource.category === activeCategory)
    : all;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">Maler og verktøy</h1>
      <p className="mt-3 max-w-2xl text-lg text-black/65">
        Maler og verktøy jeg bruker i arbeidet med produkt, team og endring. Les
        hvordan de brukes, og last dem ned.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 text-sm">
          <FilterLink href="/maler" active={!activeCategory} label="Alle" />
          {CATEGORIES.map((category) => (
            <FilterLink
              key={category}
              href={`/maler?kategori=${encodeURIComponent(category)}`}
              active={activeCategory === category}
              label={category}
            />
          ))}
      </div>

      <div className="mt-10">
        {resources.length === 0 ? (
          <p className="text-black/50">Ingenting publisert her ennå.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
