import type { Metadata } from "next";
import { SearchIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Søk",
};

// Kun design/plassering foreløpig — selve søkefunksjonen bygges senere.
export default function SearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Søk</h1>

      <div className="mt-6 flex max-w-md items-center gap-2 rounded-md border border-black/15 px-3 py-2 text-black/40">
        <SearchIcon className="h-4 w-4 shrink-0" />
        <input
          type="search"
          disabled
          placeholder="Søk i artikler…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
        />
      </div>

      <p className="mt-6 text-sm text-black/50">Søk kommer snart.</p>
    </div>
  );
}
