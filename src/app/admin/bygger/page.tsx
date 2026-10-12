import Link from "next/link";
import { BuilderForm } from "@/components/admin/builder-form";
import { CATEGORIES } from "@/lib/categories";
import { AI_GENERATION_ENABLED } from "@/lib/content-builder";

export const revalidate = 0;

export default function BuilderPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Innholdsbygger</h1>
          <p className="mt-1 text-sm text-black/60">
            Skriv litt om problemet og løsningen. Resultatet lagres som et
            utkast du leser gjennom, redigerer og planlegger selv.
          </p>
        </div>
        <Link
          href="/admin/bygger/prinsipper"
          className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-sm hover:bg-black/5"
        >
          Prinsipper
        </Link>
      </div>

      {!AI_GENERATION_ENABLED && (
        <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          AI-skriving er ikke koblet til ennå. Utkastet lages foreløpig som en
          enkel mal av det du skriver (problem først, så løsning), slik at du
          kan teste hele flyten.
        </p>
      )}

      <div className="mt-8">
        <BuilderForm categories={CATEGORIES} />
      </div>
    </div>
  );
}
