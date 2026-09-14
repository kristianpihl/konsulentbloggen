import type { Metadata } from "next";
import { MailIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Nyhetsbrev",
};

// Kun design/plassering foreløpig — selve innmeldingen bygges senere.
export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-md">
        <MailIcon className="h-6 w-6 text-black/40" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Nyhetsbrev
        </h1>
        <p className="mt-2 text-black/60">
          Meld deg på for å få nye innlegg rett i innboksen.
        </p>

        <form className="mt-6 flex gap-2">
          <input
            type="email"
            disabled
            placeholder="din@epost.no"
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none placeholder:text-black/40"
          />
          <button
            type="button"
            disabled
            className="shrink-0 rounded-md bg-black/40 px-4 py-2 text-sm font-medium text-white"
          >
            Meld på
          </button>
        </form>

        <p className="mt-4 text-sm text-black/50">Nyhetsbrev kommer snart.</p>
      </div>
    </div>
  );
}
