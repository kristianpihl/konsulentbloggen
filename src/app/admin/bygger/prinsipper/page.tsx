import Link from "next/link";
import { StyleGuideForm } from "@/components/admin/style-guide-form";
import { getStyleGuide } from "@/lib/style-guide";

export const revalidate = 0;

export default async function PrinciplesPage() {
  const principles = await getStyleGuide();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/bygger" className="text-sm text-black/60 hover:text-black">
        ← Tilbake til innholdsbyggeren
      </Link>
      <h1 className="mt-3 text-xl font-semibold">Prinsipper</h1>
      <p className="mt-1 text-sm text-black/60">
        Reglene artiklene skal skrives etter: struktur, tone, hva som er lov og
        ikke lov. Endringer gjelder neste gang du lager et utkast.
      </p>

      <div className="mt-8">
        <StyleGuideForm initial={principles} />
      </div>
    </div>
  );
}
